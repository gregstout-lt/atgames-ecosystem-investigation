# Ruby Backend - Detailed Business Logic Implementation Analysis

## User Registration Business Logic

### Registration Flow State Machine
**Location**: `app/controllers/d2d/account/registrations_controller.rb:72-136`

**Business Logic Sequence**:
1. **Validation Phase** (`enough_registration_info?` - line 157-161):
   - Requires: `legend_id`, `email`, `password`
   - Email format validation: Must contain `@` symbol
   - **Business Rule**: All three fields mandatory for registration

2. **Fraud Detection Phase** (`possible_fraud?` - line 163-185):
   - **IP Limit Rule**: 2 registrations per IP per day (configurable via `registration_ip_limit`)
   - **Email Domain Blocking**: Checks against `D2d::Fraud.check_email_domain_block`
   - **Fingerprint Fraud Check**: Validates browser fingerprint via `Fingerprint.check_fraud`
   - **IP Whitelist**: Bypass fraud checks for whitelisted IP ranges

3. **External Authentication** (line 85):
   - Delegates to `AtgamesOauthService.public_access.create_account`
   - **Integration Point**: External OAuth service handles actual account creation

4. **Token Exchange** (line 91):
   - Password grant flow via `AtgamesOauthService.public_access.password_grant`
   - **Business Rule**: Must obtain valid access token to proceed

5. **Local Account Creation** (line 96):
   - Creates local account via `AtgamesIdentity.from_omniauth`
   - **Error Handling**: Catches StandardError, logs, returns 422 status

6. **Account Activation Check** (line 107):
   - Validates `@account.active_for_authentication?`
   - **Business Rule**: Account must be active to complete registration

7. **Audit Logging** (line 118-128):
   - Logs registration event with IP, machine UUID, account UUID
   - **Integration Point**: `Loghub::ParseLogService` for audit trail

### Account Model Business Constraints
**Location**: `app/models/account.rb:1-100`

**Critical Validations**:
- `account_status`: Required (line 27)
- `account_source`: Required (line 28) 
- `stripe_key`: Unique when present (line 29)
- `uuid`: Unique when present (line 30)
- `user_name`: Unique within `social_digit` scope (line 31)
- `legend_id`: Unique when present (line 32)
- `payment_validation`: Required, not null (line 33)

**Key Relationships**:
- **Device Management**: `has_many :user_devices` (implied from controller analysis)
- **Payment Processing**: `has_many :payments`, `has_many :charged_payments`, `has_many :failed_payments` (lines 48-50)
- **Subscription Management**: Multiple subscription types - `premium_subscriptions`, `stripe_subscriptions`, `paypal_subscriptions`, etc. (lines 66-73)
- **Social Features**: `has_many :identities` for OAuth, notification systems (lines 77-96)
- **Content Ownership**: `has_many :account_inventories` (line 45)

## Device Binding Business Logic

### Device Registration Constraints
**Business Rules Identified**:
1. **Device Limit**: Account model suggests device limits (needs further investigation in UserDevice model)
2. **UUID Uniqueness**: Device UUIDs must be unique across system
3. **Account Binding**: One account per device UUID (from QT-OS analysis)

**Integration Points**:
- `D2d::Account::DevicesController` handles device operations
- Hardware UUID validation system
- **Code Reference**: Need to examine `app/controllers/d2d/account/devices_controller.rb`

## Payment Processing Business Logic

### Payment State Management
**Model Relationships** (from Account model):
- `Payment::ORDER_STATE[:CHARGED]` - Successful payments
- `Payment::ORDER_STATE[:FAILED]` - Failed payments
- Multiple payment processors: Stripe, PayPal, Xsolla

**Business Rules**:
1. **Payment Validation**: Required field `payment_validation` on accounts
2. **Multi-Processor Support**: Separate subscription models per processor
3. **Audit Trail**: All payments linked to accounts for tracking

**Integration Points**:
- `D2d::StripesController`, `D2d::PaypalsController`, `D2d::XsollaController`
- **Code References**: Need to examine individual payment controllers for state machines

## Subscription Management Business Logic

### Subscription Types Identified
**From Account Model Relationships**:
- `premium_subscriptions` - Paid premium subscriptions
- `free_subscriptions` - Free tier subscriptions  
- `stripe_subscriptions` - Stripe-managed subscriptions
- `paypal_subscriptions` - PayPal-managed subscriptions
- `xsolla_subscriptions` - Xsolla-managed subscriptions
- `complimentary_subscriptions` - Free promotional subscriptions

**Business Rules**:
1. **Multiple Active Subscriptions**: Account can have multiple subscription types simultaneously
2. **Subscription Activities**: `premium_subscription_activities` tracks subscription events
3. **Trial Management**: `trial_records` manages trial periods

## Fraud Prevention Business Logic

### Registration Fraud Detection
**Implementation Details** (`registrations_controller.rb:163-185`):

1. **IP-Based Limits**:
   ```ruby
   ip_limit = Rails.configuration.config.security.try(:registration_ip_limit) || 0
   ips.count { |x| x == request.remote_ip } < ip_limit
   ```
   - **Business Rule**: Configurable IP registration limit (default 2/day)
   - **Cache Key**: `"account_registration_ips_#{Time.now.utc.day}"`
   - **Expiration**: 24 hours

2. **Email Domain Blocking**:
   ```ruby
   fraud = true if D2d::Fraud.check_email_domain_block(parameters[:email])
   ```
   - **Integration Point**: `D2d::Fraud` service for domain validation

3. **Fingerprint Validation**:
   ```ruby
   fraud = true if Fingerprint.check_fraud(request.headers['fp'])
   ```
   - **Integration Point**: Browser fingerprinting system

4. **IP Whitelisting**:
   - **Configuration**: `Rails.configuration.config.security.registration_ip_white_list`
   - **Implementation**: IPAddr-based subnet matching

## Authentication Business Logic

### OAuth Integration Flow
**External Service Integration**:
- `AtgamesOauthService.public_access` - Central OAuth service
- **Methods**: `create_account`, `password_grant`
- **Token Management**: JWT tokens for session management

**Identity Management**:
- Multiple identity providers: Google, Facebook, AtGames
- **Model**: `AtgamesIdentity.from_omniauth` creates local accounts
- **Business Rule**: External OAuth required for account creation

## Content Access Business Logic

### Inventory Management
**From Account Relationships**:
- `account_inventories` - User's owned content
- **Integration**: SecuROM DRM system (from previous analysis)
- **Business Rule**: Content ownership tied to account inventories

### Social Features Business Logic

**Notification System**:
- Multiple notification types: Arcade, Store, New Arrivals, Updates
- **Relationship**: `notified_activities` tracks notification delivery
- **Business Rule**: Notifications can be exclusive to specific accounts

**Friend System**:
- **Integration Points**: Friend requests, friendships, social blocking
- **Code References**: `D2d::Arcade::V1::FriendRequestsController`, `D2d::Arcade::V1::FriendsController`

---

## Critical Business Logic Gaps Requiring Further Investigation

### 1. Device Management Implementation
**Missing Details**:
- Exact device limit enforcement mechanism
- Device transfer/unbinding process
- Hardware UUID validation algorithm

**Code References to Examine**:
- `app/controllers/d2d/account/devices_controller.rb`
- `app/models/user_device.rb`

### 2. Payment State Machines
**Missing Details**:
- Payment processing workflows
- Refund handling logic
- Subscription billing cycles and pro-ration

**Code References to Examine**:
- `app/controllers/d2d/stripes_controller.rb`
- `app/controllers/d2d/paypals_controller.rb`
- `app/models/payment.rb`

### 3. Content Distribution Logic
**Missing Details**:
- DRM key generation and validation
- Download limit enforcement
- Regional content restrictions

**Code References to Examine**:
- `app/controllers/d2d/products_controller.rb`
- `app/controllers/d2d/account/inventories_controller.rb`

---

*Analysis Date: 2024-12-19*  
*Focus: Actual implementation details from source code*  
*Status: Initial deep-dive complete, specific areas identified for further investigation*
