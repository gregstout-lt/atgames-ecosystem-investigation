# Ruby Backend API Endpoints Analysis (arcadenet)

## Major API Namespaces & Business Logic Areas

### 1. Account Management (`/api/account/*`)
**Core user account functionality:**
- **Authentication**: login, logout, sign_up, password management
- **Social Auth**: Facebook, Google, AtGames integration
- **Device Management**: device registration, product registration
- **Profile**: avatars, settings, legend_id updates
- **Agreements**: user agreements and confirmations

### 2. Device Integration (`/api/account/devices/*`)
**Hardware device connectivity:**
- `POST /api/account/devices/login` - Device authentication
- `GET /api/account/devices` - List user devices
- `POST /api/account/devices/register` - Register new device
- `GET /api/account/devices/my` - User's devices
- `POST /api/account/devices/_check` - Device validation (with token)

### 3. Commerce & Payments
**Multiple payment systems integrated:**
- **Stripe**: `/d2d/stripe/*` - Modern payment processing
- **PayPal**: `/d2d/paypal/*` - PayPal integration
- **Xsolla**: `/d2d/xsolla/*` - Gaming payment platform
- **Shopping Carts**: `/api/account/shopping_carts/*`
- **Purchases**: `/api/account/purchases/*`
- **Wallet**: `/api/account/wallet/*` - Trade-in system

### 4. Game Distribution & Streaming
**Game content delivery:**
- **Streaming**: `/api/account/streaming/*` - Cloud gaming services
- **Products**: `/d2d/plus/v1/products/*` - Game catalog
- **Downloads**: Product downloads and media
- **Redemption**: Code redemption system
- **Inventory**: User game inventories

### 5. Arcade Platform (`/d2d/arcade/v1/*`, `/d2d/arcade/v2/*`)
**Hardware-specific APIs:**
- **Products**: Game catalog for arcade devices
- **Leaderboards**: Score tracking and tournaments
- **Friends**: Social features
- **Subscriptions**: Arcade-specific subscriptions
- **Hardware Models**: Device compatibility

### 6. Retro Gaming (`/d2d/arcade/v3/retro/*`)
**Retro game management:**
- **License Management**: Online/offline licenses
- **Device Licenses**: Per-device game licensing
- **Redemption Codes**: Retro game code system
- **Play Tracking**: Game session management

### 7. Customer Support (`/cs/v1/*`)
**Admin and support tools:**
- **Account Management**: Admin account operations
- **Payment Support**: Fraud detection, refunds
- **Code Management**: Retro/BYOG code administration
- **Device Support**: UUID management, device troubleshooting

### 8. Business Intelligence (`/dp/*`, `/plus/*`)
**Analytics and reporting:**
- **Sales Analytics**: Revenue tracking
- **Usage Reports**: Monthly reports, best sellers
- **Trade-in Analytics**: Used game metrics

## Key Business Logic Patterns

### Authentication Flow
1. **Multi-platform auth**: Facebook, Google, AtGames, Steam
2. **Device-based auth**: Hardware devices authenticate separately
3. **Token-based validation**: Special tokens for device checks

### Game Distribution Model
1. **Multiple catalogs**: Arcade games, streaming games, retro games
2. **Licensing system**: Online/offline licenses per device
3. **Redemption codes**: Multiple code types (retro, BYOG, premium)
4. **Subscription tiers**: Different access levels

### Hardware Integration
1. **Device registration**: Products must be registered to accounts
2. **UUID management**: Hardware identification system
3. **Hardware-specific APIs**: Different endpoints for different device types
4. **Offline support**: Offline licensing for disconnected devices

### Payment Complexity
1. **Multiple processors**: Stripe, PayPal, Xsolla support
2. **Subscription management**: Recurring billing
3. **Trade-in system**: Used game credit system
4. **Promotional codes**: Discount and trial systems

---
*Analysis Date: 2024-12-19*
*Source: arcadenet/config/routes.rb*
