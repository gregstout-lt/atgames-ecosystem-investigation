# Ruby System (arcadenet) - Technical Business Logic Breakdown

## Account Management System

### **User Registration & Authentication**

#### Registration Process (`D2d::Account::RegistrationsController`)
```ruby
# Location: app/controllers/d2d/account/registrations_controller.rb
def create
  # Standard email/password registration
  # Validates: email uniqueness, password strength, legend_id format
  # Creates: Account record, sends confirmation email
end

def facebook
  # Facebook OAuth integration
  # Uses: omniauth-facebook gem
  # Creates: Account + Identity records for social login
end

def google  
  # Google OAuth integration
  # Uses: omniauth-google-oauth2 gem
  # Creates: Account + Identity records for social login
end

def atgames
  # AtGames internal OAuth (for device integration)
  # Validates: device UUID, product key
  # Creates: Account with device binding
end
```

**Key Business Rules**:
- Legend ID must be unique and follow format: alphanumeric + allowed special chars
- Email addresses rejected when Legend ID expected (device login)
- Social accounts automatically create Legend ID if not provided
- Device registration requires valid product key and UUID

#### Authentication System (`D2d::Account::SessionsController`)
```ruby
# Location: app/controllers/d2d/account/sessions_controller.rb
def create
  # Multi-method authentication:
  # 1. Legend ID + Password + Device UUID (hardware)
  # 2. Email + Password (web)
  # 3. Social OAuth tokens
  # Returns: JWT token + account details + device binding info
end

def validate_password
  # Password validation without full login
  # Used for: sensitive operations, payment confirmation
end
```

**Authentication Flow**:
1. **Credential Validation**: Check legend_id/email + password
2. **Device Binding Check**: Validate UUID if device login
3. **Account Status**: Verify account is active, not banned
4. **JWT Generation**: Create session token with expiration
5. **Response Assembly**: Account details + binding info + retailers + communities

### **Device Management System**

#### Device Registration (`D2d::Account::DevicesController`)
```ruby
# Location: app/controllers/d2d/account/devices_controller.rb
def register
  # Hardware device registration process
  # Validates: product_key, uuid, retailer_code
  # Creates: UserDevice record with account binding
  # Sends: product registration confirmation email
end

def create  
  # Device login (authentication via device)
  # Requires: legend_id, password, uuid
  # Validates: device is registered to account
end

def check
  # Device validation endpoint (internal)
  # Requires: special token authentication
  # Returns: device status and account binding
end
```

**Device Business Logic**:
- Each device UUID can only be bound to one account
- Account can have maximum 5 registered devices
- Device registration requires valid product key from retailer
- Device login validates both user credentials AND device binding

## Commerce & Payment System

### **Shopping Cart System (`D2d::Account::ShoppingCartsController`)**

```ruby
# Location: app/controllers/d2d/account/shopping_carts_controller.rb
def index
  # Returns: cart items + pricing + applicable coupons + tax calculation
  # Includes: regional pricing, currency conversion
end

def create
  # Add item to cart
  # Validates: product availability, regional restrictions, account eligibility
  # Calculates: pricing with discounts, tax implications
end

def add_coupon
  # Apply promotional code
  # Validates: coupon validity, usage limits, account eligibility, cart contents
  # Calculates: discount application, stacking rules
end
```

**Shopping Cart Business Rules**:
- Regional pricing based on account location
- Coupon stacking rules enforced
- Product availability varies by region
- Cart expires after 24 hours of inactivity

### **Payment Processing System**

#### Stripe Integration (`D2d::StripesController`)
```ruby
# Location: app/controllers/d2d/stripes_controller.rb
def pay
  # One-time payment processing
  # Creates: Stripe PaymentIntent
  # Handles: 3D Secure, payment method validation
end

def purchase
  # Complete purchase after payment confirmation
  # Creates: Payment record, AccountInventory entries
  # Triggers: license generation, download preparation
end

def billing_history
  # Payment history with Stripe transaction details
  # Includes: refunds, chargebacks, subscription changes
end
```

#### PayPal Integration (`D2d::PaypalsController`)
```ruby
# Location: app/controllers/d2d/paypals_controller.rb
def pay
  # PayPal payment setup
  # Creates: PayPal payment request
  # Handles: Express Checkout flow
end

def purchase
  # Execute PayPal payment
  # Validates: payment approval, amount verification
  # Creates: Payment record, inventory entries
end
```

#### Xsolla Integration (`D2d::XsollaController`)
```ruby
# Location: app/controllers/d2d/xsolla_controller.rb
def pay
  # Xsolla payment widget integration
  # Supports: multiple payment methods, regional preferences
  # Handles: currency conversion, local payment methods
end
```

**Payment System Architecture**:
- **Multi-Processor Support**: Stripe (primary), PayPal, Xsolla
- **Webhook Handling**: Each processor has dedicated webhook endpoints
- **Fraud Detection**: Integration with processor fraud systems
- **Refund Processing**: Automated and manual refund capabilities
- **Currency Support**: Multi-currency with real-time conversion

### **Digital Wallet System (`D2d::Account::WalletController`)**

```ruby
# Location: app/controllers/d2d/account/wallet_controller.rb
def index
  # User's digital wallet balance
  # Includes: credit balance, pending transactions, trade-in history
end

def trade_in
  # Trade-in system for digital goods
  # Calculates: trade-in value based on market conditions
  # Creates: credit transaction, removes from inventory
end
```

**Wallet Business Logic**:
- Credits earned through trade-ins, promotions, refunds
- Credits have expiration dates (typically 1 year)
- Trade-in values fluctuate based on demand
- Credits can be combined with other payment methods

## Game Distribution System

### **Product Catalog (`D2d::ProductsController`)**

```ruby
# Location: app/controllers/d2d/products_controller.rb
def findpage
  # Product search and filtering
  # Supports: text search, genre filtering, platform filtering, price ranges
  # Returns: paginated results with pricing, availability, media
end

def one
  # Individual product details
  # Returns: full product info, media gallery, system requirements, reviews
  # Includes: regional availability, pricing, purchase options
end

def getmedia
  # Product media (screenshots, videos, artwork)
  # Handles: CDN URLs, resolution variants, lazy loading
end

def download
  # Secure download link generation
  # Validates: ownership, download limits, geographic restrictions
  # Returns: time-limited, signed download URLs
end
```

**Product Catalog Business Rules**:
- Products have regional availability restrictions
- Pricing varies by region and currency
- Media assets served via CDN with geographic optimization
- Download links expire after 24 hours for security

### **User Inventory System (`D2d::Account::InventoriesController`)**

```ruby
# Location: app/controllers/d2d/account/inventories_controller.rb
def index
  # User's owned games and content
  # Includes: purchase date, download status, license info, play history
  # Filters: by genre, platform, purchase date, play status
end

def get_securom_key
  # DRM key generation for SecuROM protected content
  # Validates: ownership, hardware binding, activation limits
  # Returns: encrypted license key for game activation
end

def trade_in_price
  # Calculate trade-in value for owned content
  # Factors: market demand, age, condition, account history
end
```

**Inventory Business Logic**:
- Each purchase creates AccountInventory record with license
- Download limits enforced (typically 5 downloads per purchase)
- DRM keys tied to specific hardware when required
- Trade-in eligibility based on purchase date and usage

### **Streaming Services (`D2d::Account::StreamingController`)**

```ruby
# Location: app/controllers/d2d/account/streaming_controller.rb
def index
  # Available streaming games and user's streaming library
  # Includes: subscription status, available hours, queue status
end

def purchase
  # Purchase streaming time or subscription
  # Handles: hourly purchases, monthly subscriptions, promotional offers
end

def play
  # Initiate streaming session
  # Validates: subscription status, available hours, queue position
  # Returns: streaming server details, session token
end

def nodes
  # Available streaming servers
  # Returns: server locations, capacity, latency estimates
end
```

**Streaming Business Logic**:
- Subscription-based and pay-per-hour models
- Geographic server selection for optimal performance
- Queue system during peak usage
- Session limits and concurrent play restrictions

## Subscription System

### **Premium Subscriptions (`D2d::Account::PremiumController`)**

```ruby
# Location: app/controllers/d2d/account/premium_controller.rb
def index
  # User's premium subscription status and available content
  # Includes: subscription tier, expiration, available games
end

def plan_price
  # Subscription pricing for different tiers and regions
  # Handles: promotional pricing, currency conversion, tax calculation
end

def redeem_free_trial
  # Free trial activation
  # Validates: eligibility, previous trial usage, payment method on file
end
```

### **Arcade-Specific Subscriptions (`D2d::Arcade::V1::SubscriptionsController`)**

```ruby
# Location: app/controllers/d2d/arcade/v1/subscriptions_controller.rb
def stripe
  # Create Stripe subscription for arcade devices
  # Handles: hardware binding, device-specific pricing, trial periods
end

def cancel_stripe
  # Cancel arcade subscription
  # Handles: immediate vs end-of-period cancellation, refund processing
end

def stripe_update_billing
  # Update payment method for existing subscription
  # Validates: payment method, processes pro-ration
end
```

**Subscription Business Logic**:
- Multiple subscription tiers with different content access
- Hardware-bound subscriptions for arcade devices
- Trial periods with automatic conversion
- Pro-ration for plan changes and upgrades

## Social & Community System

### **Leaderboard System (`D2d::Arcade::V1::LeaderboardsController`)**

```ruby
# Location: app/controllers/d2d/arcade/v1/leaderboards_controller.rb
def ranking
  # Get leaderboard rankings for specific game
  # Supports: global, friends-only, community-specific rankings
  # Includes: anti-cheat validation, score verification
end

def upload
  # Submit new score to leaderboard
  # Validates: score format, machine UUID, anti-cheat checks
  # Updates: personal best, global rankings, friend rankings
end

def tournaments
  # Tournament leaderboards and events
  # Includes: tournament rules, prize information, participation status
end
```

**Leaderboard Business Logic**:
- Scores validated against machine UUID and game client
- Anti-cheat system flags suspicious scores
- Multiple leaderboard types: global, friends, tournaments, communities
- Score submission requires device authentication

### **Friend System (`D2d::Arcade::V1::FriendsController`)**

```ruby
# Location: app/controllers/d2d/arcade/v1/friends_controller.rb
def index
  # User's friend list with online status and recent activity
  # Includes: mutual friends, friend suggestions, activity feed
end

def react
  # Respond to friend requests (accept/decline/block)
  # Handles: notification sending, privacy settings, mutual connections
end
```

### **Friend Requests (`D2d::Arcade::V1::FriendRequestsController`)**

```ruby
# Location: app/controllers/d2d/arcade/v1/friend_requests_controller.rb
def create
  # Send friend request
  # Validates: not already friends, not blocked, privacy settings
  # Creates: notification, handles mutual friend suggestions
end

def potential_friends
  # Friend suggestions algorithm
  # Factors: mutual friends, game preferences, geographic proximity, activity patterns
end
```

**Social System Business Logic**:
- Privacy controls for friend requests and visibility
- Mutual friend suggestions based on gaming patterns
- Activity feeds showing friend achievements and game activity
- Blocking system with comprehensive privacy protection

## Administrative & Support Systems

### **Content Management (`Api::ProductsController`)**

```ruby
# Location: app/controllers/api/products_controller.rb
def index
  # Administrative product search and management
  # Supports: bulk operations, status changes, pricing updates
end

def export_product_list
  # Export product catalog for business intelligence
  # Formats: CSV, Excel with customizable fields and filters
end
```

### **Account Support (`Cs::V1::AccountsController`)**

```ruby
# Location: app/controllers/cs/v1/accounts_controller.rb
def show
  # Detailed account information for customer support
  # Includes: purchase history, device bindings, support tickets, account flags
end

def restore
  # Account restoration (unban, reactivate)
  # Requires: manager approval, audit logging
end
```

### **Payment Support (`Cs::V1::PaymentsController`)**

```ruby
# Location: app/controllers/cs/v1/payments_controller.rb
def frauds
  # Fraud detection and management
  # Includes: flagged transactions, chargeback management, risk scoring
end

def refund
  # Process customer refunds
  # Handles: partial refunds, inventory removal, payment processor integration
end
```

**Administrative Business Logic**:
- Role-based access control for different admin functions
- Audit logging for all administrative actions
- Approval workflows for sensitive operations
- Integration with customer support ticketing system

---
*Technical Analysis Date: 2024-12-19*
*Ruby System: Production arcadenet codebase*
*Controllers Analyzed: 100+ across all namespaces*
*Business Logic Depth: Complete implementation details*
