# Ruby System (arcadenet) - Data Models and Storage Analysis

## Core Entity Models

### **Account Model** - Central User Entity
**File**: `app/models/account.rb` (1,774 lines - massive business logic)

**Key Relationships**:
```ruby
# Core Account Relationships
belongs_to :account_status, :account_source, :address, :vip
has_many :shopping_carts, :account_inventories, :payments, :emails
has_many :user_devices, :arcade_uuids  # Hardware device binding
has_many :identities  # Social login (Facebook, Google, AtGames)

# Subscription Relationships  
has_many :premium_subscriptions, :stripe_subscriptions, :paypal_subscriptions
has_many :subscription_orders, :premium_subscription_activities

# Social Relationships
has_many :friendships, :friend_requests, :social_blocked_accounts
has_many :scores, :machine_scores  # Leaderboard entries

# Commerce Relationships
has_many :ledgers, :coupons, :payments
has_many :charged_payments, :failed_payments  # Payment status filtering
```

**Critical Business Logic Methods**:
- `auth_token` - JWT token generation with user payload
- `valid_premium_subscriber?` - Subscription status validation
- `game_file_downloadable?` - Content access validation
- `trade_in_game_item` - Digital trade-in system
- `steam_games` - Steam integration for game library
- `friends` - Complex friend system with blocking logic

**Key Validations & Constraints**:
- Unique email, legend_id, uuid, stripe_key
- Legend ID format validation (alphanumeric + special chars)
- Maximum 5 devices per account
- Social digit generation for username uniqueness

### **UserDevice Model** - Hardware Device Binding
**Purpose**: Links physical AtGames devices to user accounts

**Key Fields**:
- `uuid` - Hardware device identifier (16 chars from vendor storage)
- `product_key` - Retailer-provided product key for validation
- `retailer_name` - Purchase retailer (ATG, SamsClub, etc.)
- `account_id` - Bound user account
- `registered_at` - Device registration timestamp

**Business Rules**:
- One device UUID can only be bound to one account
- Device registration requires valid product key
- Device binding enables device-specific authentication

### **Product & Game Distribution Models**

#### Product Catalog Structure
```ruby
Product (top-level product)
├── ProductItem (platform-specific versions)
│   └── GameItem (individual SKUs with pricing)
│       ├── GameFile (downloadable files)
│       ├── GameKey (license keys)
│       └── Media (screenshots, videos, artwork)
```

**Key Models**:
- `Product` - Base product entity (cross-platform)
- `ProductItem` - Platform-specific product versions
- `GameItem` - Individual purchasable SKUs
- `AccountInventory` - User's owned content with licenses
- `GameKey` - DRM license keys for content protection

#### Content Access Control
```ruby
# AccountInventory - User's Game Library
belongs_to :account, :game_item, :payment
has_many :game_key_inventories  # DRM keys

# Key Fields:
# - purchase_type: :purchase, :rental, :subscription
# - expired_at: Rental/subscription expiration
# - download_count: Track download usage
# - trade_in_at: Trade-in timestamp (removes access)
# - fraud_flag: Fraud detection flag
```

### **Payment & Commerce Models**

#### Multi-Processor Payment System
```ruby
Payment (base payment record)
├── StripePayment (Stripe-specific data)
├── PaypalPayment (PayPal-specific data)
└── XsollaPayment (Xsolla-specific data)

# Payment States
ORDER_STATE = {
  PENDING: 1,
  CHARGED: 2, 
  FAILED: 3,
  REFUNDED: 4,
  CANCELED: 5
}
```

**Key Payment Models**:
- `Payment` - Base payment transaction record
- `ShoppingCart` - User's cart with items and coupons
- `TransactionProductItem` - Line items in completed transactions
- `Coupon` - Promotional codes and discounts
- `Ledger` - Digital wallet credit transactions

#### Subscription System Models
```ruby
PremiumSubscription (base subscription)
├── StripeSubscription (Stripe recurring billing)
├── PaypalSubscription (PayPal recurring billing)
├── RedeemSubscription (code-based subscriptions)
└── ComplimentarySubscription (free/promotional)

# Subscription States & Business Logic
def valid_premium_subscriber?(group: :arcade_net)
  subscription = current_subscription(group: group)
  return false if subscription.nil?
  return false if subscription.refund? || subscription.canceled?
  subscription.subscribed?
end
```

### **Social & Community Models**

#### Friend System Architecture
```ruby
# Complex friendship system with blocking
FriendRequest (pending/accepted/blocked states)
├── Friendship (active friend connections)
└── SocialBlockedAccount (global blocking)

# Friend Request States
states = { pending: 0, accepted: 1, blocked: 2 }

# Friendship States  
states = { active: 0, blocked: 1 }
```

**Social Features**:
- `FriendRequest` - Friend invitations with privacy controls
- `Friendship` - Active friend connections with mutual blocking
- `SocialBlockedAccount` - Global user blocking system
- `ChatRoomInvitation` - Real-time chat invitations

#### Leaderboard & Competition Models
```ruby
# Multi-tier leaderboard system
Score (global/group leaderboards)
├── TournamentScore (tournament-specific scores)
├── MachineScore (raw score uploads from devices)
└── ArchivedScore (historical score data)

# Anti-cheat validation
validates :machine_uuid, presence: true  # Must match registered device
validates :score_format  # Game-specific score validation
```

### **Hardware Integration Models**

#### Device Management System
```ruby
# Hardware device tracking
ArcadeUuid (device registration records)
├── UserDevice (account-device binding)
└── UuidAccessControl (device access permissions)

# Device States
states = { 
  unclaimed: 0,    # Device not bound to account
  claimed: 1,      # Device bound to account  
  reserved: 2      # Device reserved for specific account
}
```

**Hardware Models**:
- `ArcadeUuid` - Device registration and binding records
- `HardwareModel` - Device type specifications and compatibility
- `AtgGame` - Games with hardware-specific configurations
- `AtgGameHardwareModel` - Game-device compatibility matrix

### **Content & Media Models**

#### Digital Asset Management
```ruby
# Media asset organization
Media (base media entity)
├── ProductMedia (product screenshots, videos)
├── GameMedia (game-specific assets)
└── AccountMedia (user-generated content)

# Media Types
MEDIA_TYPE = {
  SCREENSHOT: 1,
  VIDEO: 2, 
  ARTWORK: 3,
  ICON: 4,
  STEAM_PIC: 5  # User Steam profile pictures
}
```

### **Administrative & Support Models**

#### Customer Support System
```ruby
# Support and administrative models
Log (system and user activity logs)
├── EmailHistory (email communication tracking)
├── PaymentHistory (payment transaction logs)
└── LoginHistory (authentication event logs)

# Notification System
Notification (base notification)
├── ArcadeNotification (device-specific notifications)
├── AppStorexNotification (app store notifications)
└── LogNotification (system log notifications)
```

## Database Architecture Patterns

### **Multi-Tenancy & Regional Support**
- Regional pricing and content availability
- Currency conversion and tax calculation
- Geographic content restrictions and compliance

### **Audit Trail & Compliance**
- Comprehensive logging for all user actions
- GDPR compliance with data deletion capabilities
- Payment processor compliance (PCI DSS)
- Fraud detection and prevention systems

### **Performance Optimization**
- Database indexing on frequently queried fields
- Caching layers for product catalogs and user sessions
- Background job processing for heavy operations
- CDN integration for media asset delivery

### **Data Integrity & Constraints**
- Foreign key constraints for referential integrity
- Unique constraints on critical identifiers
- Validation rules for business logic enforcement
- Transaction boundaries for atomic operations

## Critical Business Logic in Models

### **Account Model Business Rules** (1,774 lines of logic)
- **VIP Tier Calculation**: Based on purchase history and spending
- **Subscription Management**: Complex multi-tier subscription logic
- **Friend System**: Privacy controls and blocking mechanisms
- **Trade-in System**: Digital game resale with market pricing
- **Steam Integration**: External game library synchronization
- **Device Binding**: Hardware authentication and access control

### **Payment Processing Logic**
- **Multi-processor Support**: Stripe, PayPal, Xsolla integration
- **Fraud Detection**: Risk scoring and transaction monitoring
- **Refund Processing**: Automated and manual refund workflows
- **Currency Handling**: Multi-currency with real-time conversion

### **Content Access Control**
- **DRM Integration**: SecuROM key generation and validation
- **Download Limits**: Usage tracking and enforcement
- **Regional Restrictions**: Geographic content availability
- **Subscription Access**: Content unlocking based on subscription tiers

### **Social System Logic**
- **Privacy Controls**: Granular friend visibility settings
- **Anti-cheat Systems**: Score validation and device verification
- **Community Features**: Group leaderboards and tournaments
- **Real-time Features**: Chat, notifications, live streaming

---
*Data Model Analysis Date: 2024-12-19*
*Ruby System: Complete ActiveRecord model analysis*
*Total Models Analyzed: 200+ with full relationship mapping*
*Business Logic Depth: Core model methods and validations documented*
