# Pinball Machine Registration and First-Week Promotional Logic

## Business Process Overview

When a customer purchases a new AtGames pinball machine and signs up with their Legends ID, a complex registration and promotional qualification process occurs that determines eligibility for "week one deals" and other time-sensitive promotional offers.

## Machine Registration Flow

### Step 1: Initial Device Login
**Location**: `app/controllers/d2d/account/devices_controller.rb:94-179`

**Process Sequence**:
1. **OAuth Device Grant Flow**: Machine initiates authentication via QR code
2. **Account Binding**: `bind_uuid_2_ads(account)` called (line 140)
3. **UUID Logging**: Machine UUID sent to ADS (Arcade Data Service) via `ArcadeUuid.logging_uuid_to_ads!`
4. **Launch Package Qualification Check**: `account.launch_package_qualified?(arcade_info)` (line 151)

### Step 2: UUID Binding to ADS
**Location**: `app/models/arcade_uuid.rb:46-65`

**Business Logic**:
```ruby
def logging_uuid_to_ads!(uuid, account, options = {})
  binding_result = AdsApi::ArcadeUuid.binding(
    uuid: uuid,
    email: account.email,
    legend_id: account.legend_id,
    external_user_id: account.account_id,
    activity: options.fetch(:purpose, 'ArcadeNetSignIn'),
    firmware: options[:firmware].to_s
  )
end
```

**Critical Data Captured**:
- Machine UUID (hardware identifier)
- User email and Legends ID
- Account ID (internal identifier)
- Binding timestamp
- Retailer information (where machine was purchased)

### Step 3: Automatic Device Registration
**Location**: `app/models/concerns/launch_package.rb:47-52`

**Business Rule**:
```ruby
def auto_register_device_to_first_login_account(arcade_info)
  return unless Rails.configuration.config.product_registration.enabled
  return if UserDevice.find_by(uuid: arcade_info[:uuid]).present? || arcade_info[:retailer_name] == 'Unknown'
  
  register_device(arcade_info[:uuid], official_retailer_name: arcade_info[:retailer_name])
end
```

**Key Business Logic**:
- **First Login Binding**: Device automatically registers to the first account that logs in
- **One-Time Registration**: Subsequent logins do not change device ownership
- **Retailer Validation**: Unknown retailers are excluded from automatic registration

## First-Week Promotional Logic

### Launch Package Qualification
**Location**: `app/models/concerns/launch_package.rb:27-38`

**Qualification Criteria**:
```ruby
def launch_package_qualified?(arcade_info)
  return false unless Rails.configuration.config.enable_launch_package
  return false if arcade_info.blank?
  return false unless ArcadeUuid.in_free_beta_white_list?(arcade_info[:binding_info][:retailer_name])
  return false if in_black_list?
  
  not_given_yet?
end
```

**Business Rules**:
1. **Feature Flag**: `enable_launch_package` must be enabled
2. **Retailer Whitelist**: Only specific retailers qualify (Samclub, Walmart, ATG, ATGCS)
3. **Account Blacklist**: Certain accounts are excluded from promotions
4. **One-Time Offer**: Account must not have received launch package previously

### Promotional Timing Determination

**Configuration**: `config/config.yml.sample:243-244`
```yaml
enable_launch_package: false
launch_package_period: '1.month'
```

**Duration Calculation** (`launch_package.rb:103-110`):
```ruby
def eval_stop_at_duration
  duration = eval(Rails.configuration.config.launch_package_period)
  raise 'Has to be ActiveSupport::Duration object' unless duration.is_a? ActiveSupport::Duration
  duration
rescue RuntimeError
  1.month  # Default fallback
end
```

**Critical Timing Logic**:
- **Promotional Period**: Configurable duration (default: 1 month)
- **Start Date**: Time of first successful login (`Time.current`)
- **End Date**: Start date + promotional period
- **No Renewal**: `stop_renewing_at: Time.current` prevents automatic renewal

## Week One Deals Implementation

### Promotional Subscription Creation
**Location**: `app/models/concerns/launch_package.rb:59-82`

**Process**:
```ruby
def assign_complimentary_subscription(memo = nil)
  return unless not_given_yet?
  
  create_launch_package_plan_if_needed
  plan = Plan.find_by(external_id: Plan::LAUNCH_PACKAGE_PLAN_ID)
  
  ActiveRecord::Base.transaction do
    stop_at = Time.current + eval_stop_at_duration
    
    launch_package_subscription = self.complimentary_subscriptions.create!(
      account_id: self.account_id,
      external_subscription_id: plan.title,
      external_plan_id: plan.external_id,
      plan: plan,
      start_date: Time.current,
      date_next_charge: stop_at,
      stop_renewing_at: Time.current,
      source: PremiumSubscription.sources['from_arcade']
    )
  end
end
```

**Business Logic**:
- **Immediate Activation**: Subscription starts at `Time.current`
- **Fixed Duration**: Ends after configured period (typically 1 month)
- **No Billing**: Complimentary subscription with no charges
- **Audit Trail**: Creates `PremiumSubscriptionActivity` record with `grand_launch` action

## Critical Business Rules for "Week One Deals"

### 1. First Login Timestamp Determination
**How System Knows "Week One"**:
- **Device Binding Time**: Captured in `ArcadeUuid.logging_uuid_to_ads!` call
- **Subscription Start**: `start_date: Time.current` in complimentary subscription
- **Promotional Window**: Calculated from first login, not purchase date

### 2. Retailer-Based Qualification
**Whitelist Check** (`arcade_uuid.rb:114-124`):
```ruby
def in_free_beta_white_list?(retailer_name)
  return false if retailer_name.blank?
  free_beta_white_list.any? { |r| r.casecmp(retailer_name) == 0 }
end

def free_beta_white_list
  Rails.configuration.config.free_beta_white_list || %w[Samclub Walmart ATG ATGCS]
end
```

### 3. One-Time Qualification Logic
**Prevention of Multiple Claims** (`launch_package.rb:54-57`):
```ruby
def not_given_yet?
  premium_subscription_activities.where(action: PremiumSubscriptionActivity.actions[:grand_launch]).count.zero? &&
    current_subscription(group: :arcade_net, options: { leeway: true }).blank?
end
```

## Data Flow for Promotional Timing

### 1. Machine Purchase → First Login
- Customer purchases machine from qualified retailer
- Machine contains hardware UUID
- Customer creates account or logs in with existing Legends ID

### 2. First Login → Timestamp Capture
- `ArcadeUuid.logging_uuid_to_ads!` sends binding request to ADS
- ADS returns retailer information and binding timestamp
- Local `ArcadeUuid` record created with account association

### 3. Promotional Qualification → Activation
- System checks retailer whitelist
- Verifies account hasn't received launch package
- Creates complimentary subscription with start/end dates
- Promotional period begins immediately

### 4. Promotional Period Tracking
- Subscription `start_date` = first login timestamp
- Subscription `date_next_charge` = end of promotional period
- System can calculate "days remaining" for promotional offers

## Integration Points

### External Systems
- **ADS (Arcade Data Service)**: Manages UUID binding and retailer information
- **Stripe/Payment Processors**: Handle subscription management after promotional period
- **Configuration System**: Controls promotional periods and retailer whitelists

### Internal Dependencies
- **Account Model**: User authentication and profile management
- **PremiumSubscription**: Subscription lifecycle management
- **ArcadeUuid**: Device binding and ownership tracking
- **Plan Model**: Promotional plan definitions

## Business Implications

### For "Week One Deals"
1. **Timing Accuracy**: System accurately tracks first login, not purchase date
2. **Retailer Restrictions**: Only qualified retailers enable promotional offers
3. **Account Limitations**: One promotional period per account, regardless of multiple machines
4. **Duration Flexibility**: Promotional periods configurable per deployment

### For System Reconstruction
1. **Critical Data**: UUID binding timestamp is essential for promotional logic
2. **Retailer Integration**: ADS system provides retailer validation
3. **Configuration Dependencies**: Promotional rules controlled by configuration flags
4. **Audit Requirements**: All promotional activities logged for compliance

---

*Analysis Date: 2024-12-19*  
*Focus: Pinball machine registration and first-week promotional timing logic*  
*Status: Complete business process mapping with implementation details*
