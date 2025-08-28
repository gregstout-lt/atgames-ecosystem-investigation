# Ruby System (arcadenet) - Internal Architecture Analysis

## Application Architecture Overview

The Ruby system follows a **layered monolithic architecture** with clear separation of concerns across multiple business domains. Built on **Ruby on Rails 5.x** with extensive customizations for gaming industry requirements.

## Directory Structure & Organization

### **Controller Layer Architecture**
```
app/controllers/
├── api/              # Administrative API (50+ controllers)
├── cs/               # Customer Support API (25+ controllers)  
├── d2d/              # Direct-to-Device API (85+ controllers)
├── dp/               # Data Portal/Analytics (5+ controllers)
├── arcade/           # Hardware-specific API (5+ controllers)
├── external/         # External integration API (2+ controllers)
└── concerns/         # Shared controller logic (20+ modules)
```

**Controller Namespace Strategy**:
- **API Versioning**: Multiple versions (v1, v2, v3, v4) with backward compatibility
- **Domain Separation**: Clear business domain boundaries
- **Access Control**: Role-based access with different privilege levels
- **Response Formatting**: Consistent JSON API responses with error handling

### **Service Layer Architecture**
```
app/services/
├── authentication/   # User authentication services
├── payment/         # Payment processor integrations  
├── streaming/       # Cloud gaming services
├── notification/    # Email and push notification services
├── content/         # Game content and media services
├── social/          # Friend and community services
├── analytics/       # Business intelligence services
└── integration/     # External API integrations
```

**Service Design Patterns**:
- **Single Responsibility**: Each service handles one business domain
- **Dependency Injection**: Services composed through initialization
- **Error Handling**: Consistent exception handling and logging
- **Transaction Management**: Database transactions for atomic operations

### **Model Layer Organization**
```
app/models/
├── account.rb           # Central user entity (1,774 lines)
├── concerns/            # Shared model behaviors (20+ modules)
├── payment/            # Payment-related models (15+ models)
├── subscription/       # Subscription models (10+ models)
├── social/             # Social feature models (8+ models)
├── content/            # Game and media models (25+ models)
├── hardware/           # Device integration models (5+ models)
└── administrative/     # Admin and support models (10+ models)
```

## Business Domain Architecture

### **1. Authentication & User Management Domain**

**Core Components**:
- **Devise Integration**: Extended with custom strategies
- **Multi-Provider OAuth**: Facebook, Google, AtGames, Steam
- **JWT Token Management**: Custom token generation and validation
- **Device Binding**: Hardware UUID-based authentication

**Architecture Pattern**:
```ruby
# Authentication Flow
DeviceAuthenticationStrategy
├── CredentialValidator (legend_id + password)
├── DeviceValidator (UUID + product_key)  
├── TokenGenerator (JWT with custom payload)
└── SessionManager (Redis-backed sessions)
```

**Key Design Decisions**:
- **Stateless Authentication**: JWT tokens for API access
- **Device-Bound Sessions**: Hardware UUID validation
- **Multi-Factor Authentication**: User credentials + device validation
- **Social Login Integration**: OAuth provider abstraction

### **2. Commerce & Payment Domain**

**Multi-Processor Architecture**:
```ruby
# Payment Processing Strategy Pattern
PaymentProcessor
├── StripeProcessor (primary processor)
├── PaypalProcessor (alternative processor)
└── XsollaProcessor (gaming-focused processor)

# Each processor implements:
# - create_payment(amount, payment_method)
# - process_webhook(payload)
# - handle_refund(payment_id, amount)
# - validate_transaction(transaction_data)
```

**Shopping Cart System**:
- **Session-Based Carts**: Persistent across user sessions
- **Complex Pricing Logic**: Regional pricing, taxes, discounts
- **Coupon System**: Stackable discounts with business rules
- **Inventory Validation**: Real-time availability checking

**Payment State Management**:
```ruby
# Payment Lifecycle
PENDING → CHARGED → [REFUNDED|COMPLETED]
    ↓
  FAILED → CANCELED
```

### **3. Content Distribution Domain**

**Product Catalog Architecture**:
```ruby
# Hierarchical Product Structure
Product (cross-platform base)
├── ProductItem (platform-specific)
│   ├── GameItem (purchasable SKU)
│   │   ├── GameFile (downloadable content)
│   │   ├── GameKey (DRM license)
│   │   └── Media (assets)
│   └── Pricing (regional pricing)
└── Availability (regional restrictions)
```

**Content Delivery System**:
- **CDN Integration**: Geographically distributed content
- **DRM Protection**: SecuROM integration for protected content
- **Download Management**: Usage tracking and limits
- **Streaming Integration**: Cloud gaming service connectivity

### **4. Subscription Management Domain**

**Multi-Tier Subscription Architecture**:
```ruby
# Subscription Hierarchy
PremiumSubscription (base class)
├── StripeSubscription (recurring billing)
├── PaypalSubscription (alternative billing)
├── RedeemSubscription (code-based)
└── ComplimentarySubscription (promotional)

# Subscription Groups
groups = {
  arcade_net: 1,      # Hardware device subscriptions
  byog: 2,           # Bring Your Own Game
  plus: 3,           # Premium web service
  arcade_net_redeem: 4 # Redeemable arcade subscriptions
}
```

**Billing Cycle Management**:
- **Flexible Intervals**: Monthly, quarterly, annual billing
- **Pro-ration Logic**: Plan changes with credit/debit calculation
- **Grace Periods**: Subscription leeway for payment processing
- **Trial Management**: Free trial periods with automatic conversion

### **5. Social & Community Domain**

**Friend System Architecture**:
```ruby
# Complex Social Relationship Management
FriendRequest → Friendship
    ↓              ↓
 [blocked]    [active|blocked]
    ↓              ↓
SocialBlockedAccount ← GlobalBlocking
```

**Privacy & Blocking System**:
- **Granular Privacy Controls**: Friend visibility settings
- **Multi-Level Blocking**: Friend-level and global blocking
- **Mutual Friend Suggestions**: Algorithm-based recommendations
- **Activity Feeds**: Friend activity and achievement tracking

**Leaderboard System**:
```ruby
# Multi-Tier Competition System
Score (global/group leaderboards)
├── TournamentScore (event-specific)
├── MachineScore (raw device uploads)
└── FriendScore (friend-only rankings)

# Anti-Cheat Integration
validates :machine_uuid  # Device verification
validates :score_format  # Game-specific validation
validates :submission_timing  # Temporal validation
```

## Infrastructure Architecture

### **Database Design Patterns**

**Connection Management**:
- **Primary Database**: PostgreSQL for transactional data
- **Read Replicas**: Performance optimization for queries
- **Connection Pooling**: Efficient database connection management
- **Migration Strategy**: Versioned schema changes with rollback support

**Indexing Strategy**:
```sql
-- Critical Performance Indexes
CREATE INDEX idx_account_email ON account(email);
CREATE INDEX idx_account_uuid ON account(uuid);  
CREATE INDEX idx_user_device_uuid ON user_device(uuid);
CREATE INDEX idx_payment_account_status ON payment(account_id, order_state);
CREATE INDEX idx_inventory_account_game ON account_inventory(account_id, game_item_id);
```

### **Caching Architecture**

**Multi-Layer Caching**:
```ruby
# Caching Strategy
Rails.cache (Redis)
├── Fragment Caching (view partials)
├── Query Caching (database results)  
├── Session Caching (user sessions)
└── API Response Caching (external calls)

# Cache Keys Strategy
"account:#{account_id}:profile"
"product:#{product_id}:#{region_id}"
"leaderboard:#{game_id}:global"
```

### **Background Job Processing**

**Delayed Job Architecture**:
```ruby
# Job Queue Management
DelayedJob
├── EmailJobs (notifications, confirmations)
├── PaymentJobs (webhook processing)
├── ContentJobs (media processing)
├── SocialJobs (friend notifications)
└── AnalyticsJobs (data aggregation)

# Job Priorities
priority: 0   # Critical (payment processing)
priority: 10  # High (user notifications)  
priority: 20  # Normal (content processing)
priority: 30  # Low (analytics, cleanup)
```

### **External Integration Architecture**

**API Integration Patterns**:
```ruby
# External Service Integrations
ExternalService
├── PaymentGateways (Stripe, PayPal, Xsolla)
├── SocialProviders (Facebook, Google, Steam)
├── ContentDelivery (CDN, DRM services)
├── CloudGaming (streaming infrastructure)
├── EmailServices (transactional email)
└── AnalyticsServices (business intelligence)
```

**Integration Reliability**:
- **Circuit Breaker Pattern**: Prevent cascade failures
- **Retry Logic**: Exponential backoff for failed requests
- **Webhook Validation**: Secure webhook processing
- **Rate Limiting**: API usage throttling and quotas

## Security Architecture

### **Authentication Security**

**Multi-Layer Security**:
```ruby
# Security Layers
DeviceBinding (hardware UUID validation)
├── CredentialValidation (password + 2FA)
├── TokenSecurity (JWT with expiration)
├── SessionManagement (secure session handling)
└── AuditLogging (comprehensive activity logs)
```

### **Data Protection**

**Encryption & Privacy**:
- **Password Hashing**: bcrypt with salt rounds
- **PII Encryption**: Sensitive data encryption at rest
- **GDPR Compliance**: Data deletion and export capabilities
- **Audit Trails**: Comprehensive logging for compliance

### **API Security**

**Access Control**:
```ruby
# Role-Based Access Control
Role
├── AdminRole (full system access)
├── SupportRole (customer support access)
├── UserRole (standard user access)
└── DeviceRole (hardware device access)

# Permission System
RoleResource
├── AccountManagement
├── PaymentProcessing
├── ContentManagement
└── SystemAdministration
```

## Performance Architecture

### **Optimization Strategies**

**Database Optimization**:
- **Query Optimization**: N+1 query prevention with includes/joins
- **Pagination**: Efficient large dataset handling
- **Database Partitioning**: Large table performance optimization
- **Connection Pooling**: Database connection efficiency

**Application Performance**:
```ruby
# Performance Monitoring
NewRelic Integration
├── Application Performance Monitoring
├── Database Query Analysis
├── External Service Monitoring
└── Error Tracking and Alerting
```

### **Scalability Patterns**

**Horizontal Scaling Preparation**:
- **Stateless Design**: Session data externalized to Redis
- **Database Read Replicas**: Read traffic distribution
- **CDN Integration**: Static asset distribution
- **Microservice Boundaries**: Clear domain separation for future extraction

---
*Internal Architecture Analysis Date: 2024-12-19*
*Ruby System: Complete architectural documentation*
*Architecture Pattern: Layered monolithic with domain separation*
*Scalability: Prepared for microservice extraction*
