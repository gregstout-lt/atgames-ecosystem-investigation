# Hardware Integration Analysis (CE-OS + QT-OS)

## System Architecture Overview

The AtGames hardware ecosystem consists of two primary software layers running on Rockchip-based devices:

1. **CE-OS** - C++ Magic Pixel Engine (Core system)
2. **QT-OS** - Qt-based Menu System (User interface)

## QT-OS: Hardware-to-Cloud Bridge

### **Authentication & Device Identity**

**Device UUID System**:
```cpp
// From util/rk_util.cpp
QString getRKUUID() {
    static QString s_uuid = "8800VC000000119"; // Fallback for testing
    
    // Hardware read from vendor storage
    rk_vendor_req rkvendor;
    if (0 == vendor_storage_read(1, &rkvendor)) {
        return QString::fromLocal8Bit((char*)rkvendor.data, 16);
    }
    return s_uuid;  // Fallback if hardware read fails
}
```

**Key Characteristics**:
- **Hardware-based UUID**: Read from Rockchip vendor storage
- **16-character limit**: Exactly 16 bytes from hardware
- **Device binding**: Each device has unique identifier
- **Format examples**: `8800VC000000119`, `8819D...`, `880192...`

### **Backend Communication Architecture**

**Multi-Environment Support**:
- **Production**: `https://arcadenet-api.atgames.net`
- **Stage**: `https://arcadenet-stage-api.atgames.net`
- **QA**: `https://arcadenet-api-qa.atgames.net`

**Authentication Flow**:
1. **Device Registration**: UUID must be registered with AtGames backend
2. **User Authentication**: Legends ID + Password + Device UUID
3. **Token Management**: JWT tokens for session management
4. **Device Binding**: Account can be bound to specific hardware

### **API Communication Patterns**

**HTTP Request Structure**:
```cpp
// Standard headers for all requests
request.setRawHeader("Content-Type", "application/json");
request.setRawHeader("Accept", "application/json");
request.setRawHeader("APP-VERSION", currentVersion);
request.setRawHeader("UUID", deviceUUID);
request.setRawHeader("User-Agent", "AtGames/[Version]");
request.setRawHeader("devise", "Arcade");
request.setRawHeader("fp", fingerprint);
```

**Login Payload Example**:
```json
{
    "legend_id": "UserLegendID123",
    "password": "userpassword", 
    "uuid": "8800VC000000119"
}
```

### **Business Logic Integration**

**Subscription Management**:
- **Monthly Billing**: `$19.99/month` with 2-month free trial
- **Payment Collection**: Credit card captured before trial activation
- **Billing Cycle**: Monthly recurring after trial period
- **API Endpoints**: Dual endpoints for trial vs regular subscriptions

**Game Distribution**:
- **License Management**: Online/offline game licenses per device
- **Content Delivery**: Game downloads and streaming
- **DRM Integration**: SecuROM key management
- **Redemption Codes**: Multiple code types (retro, BYOG, premium)

## CE-OS: Core Engine Layer

### **System Architecture**

**Component Structure**:
- **Engine**: Core framework for applications
- **Platform**: Platform-specific implementations (Rockchip)
- **Program**: Applications built on the engine (EasyMode)
- **Common**: External libraries and dependencies

**Hardware Support**:
- **Target Platforms**: rk3328, rk3399, rk3588 Rockchip CPUs
- **Cross-compilation**: Single build runs on all supported hardware
- **Magic Pixel License**: Limited to AtGames Legends platform

### **Integration with QT-OS**

**Subscription System Integration**:
```cpp
// CE-OS Purchase.cpp - Current annual subscription
PurchaseStatus MakeSubscription(std::string planID, std::string cardID) {
    // Current: "Legends 4K PinballNet 365 Day Subscription": $150.0
    // Needed: Monthly billing with trial support
}
```

**Required Modernization**:
- **Dual API Endpoints**: Trial vs regular subscription creation
- **Monthly Billing Logic**: Replace annual with monthly cycles
- **Payment Flow**: Upfront credit card collection
- **UI Messaging**: Monthly billing communication

### **Business Logic Distribution**

**CE-OS Responsibilities**:
- **Core Game Engine**: Game execution and rendering
- **Hardware Interface**: Direct hardware control
- **Local Game Management**: Offline game licensing
- **System Configuration**: Device settings and preferences

**QT-OS Responsibilities**:
- **User Interface**: All user-facing menus and dialogs
- **Network Communication**: API calls to backend services
- **Authentication**: User login and session management
- **Content Management**: Game catalog and downloads

## Integration Points with Backend Services

### **Ruby Backend Integration** (Primary)

**Device Management**:
- `POST /api/account/devices/login` - Device authentication
- `POST /api/account/devices/register` - Device registration
- `GET /api/account/devices/my` - User's registered devices

**Game Distribution**:
- `/d2d/arcade/v1/products/*` - Game catalog access
- `/d2d/arcade/v3/retro/*` - Retro game licensing
- **License Management**: Online/offline licenses per device
- **Redemption System**: Code-based game activation

**Subscription Services**:
- `/d2d/arcade/v1/subscriptions/*` - Subscription management
- **Payment Processing**: Stripe integration for billing
- **Trial Management**: Free trial period handling

### **Java Backend Integration** (Limited)

**Subscription Focus**:
- `/api/v1/user/subscriptions` - User subscription status
- **Admin Operations**: Subscription management tools
- **Statistics**: Usage and billing analytics

**Missing Integration**:
- No device management endpoints
- No game distribution system
- Limited to subscription-focused operations

## Hardware-Specific Business Logic

### **Device Binding System**

**UUID-Based Security**:
- Each device has unique hardware identifier
- Accounts can be bound to specific devices
- Prevents unauthorized access from different hardware
- Server validates UUID against registered devices

**Registration Process**:
1. **Initial Setup**: Device UUID read from hardware
2. **Account Binding**: User account linked to device UUID
3. **Validation**: Server checks UUID on each authentication
4. **License Management**: Games licensed per device UUID

### **Offline Capabilities**

**Local License Management**:
- Games can be licensed for offline play
- Licenses stored locally on device
- Periodic online validation required
- Offline mode for disconnected operation

**Content Caching**:
- Game assets cached locally
- Reduced bandwidth requirements
- Faster game loading times
- Offline game availability

## Critical Dependencies

### **System Requirements**
1. **Network Connectivity**: HTTPS access to AtGames servers
2. **System Time**: Accurate time for SSL validation
3. **Hardware UUID**: Accessible device identification
4. **SSL Certificates**: Valid certificate chain

### **Backend Dependencies**
1. **Ruby Backend**: Primary business logic and APIs
2. **Authentication Servers**: User login validation
3. **Content Delivery**: Game distribution system
4. **Payment Processing**: Stripe/PayPal integration

### **Hardware Dependencies**
1. **Rockchip Platform**: Vendor storage access for UUID
2. **Network Interface**: Ethernet/WiFi connectivity
3. **Storage**: Local game and license storage
4. **Display**: User interface rendering

## Modernization Considerations

### **Current Challenges**
1. **Dual System Complexity**: CE-OS + QT-OS coordination
2. **Hardware Dependencies**: Rockchip-specific implementations
3. **Legacy Integration**: Tight coupling with Ruby backend
4. **Subscription Mismatch**: Annual (CE-OS) vs Monthly (QT-OS) billing

### **Future Architecture Options**
1. **Unified System**: Single application handling both engine and UI
2. **Microservices**: Decompose backend into focused services
3. **Modern Frontend**: Web-based UI with local backend
4. **Cloud Integration**: Enhanced cloud services integration

---
*Analysis Date: 2024-12-19*
*Sources: QT-OS login documentation, CE-OS system documentation*
