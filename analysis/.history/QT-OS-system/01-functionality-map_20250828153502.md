# QT-OS System - Complete Functionality Map

## System Architecture Overview

The QT-OS system is a **Qt-based hardware interface application** that serves as the primary user interface and backend communication layer for AtGames hardware devices. It handles device-to-cloud communication, local system management, and user interface presentation.

### **Core System Components**

| **Component Category** | **Purpose** | **Key Classes** | **Location** | **External Dependencies** |
|------------------------|-------------|-----------------|-------------|---------------------------|
| **Network Communication** |
| `HttpRequestFactory` | Backend API communication | `createD2DHttpRequest()`, `setD2DApiHeaders()` | `app/services/` | Ruby backend APIs |
| `NetworkResponseHandler` | HTTP response processing | `handleResponse()`, `parseErrorMessages()` | `app/helper/` | Qt Network module |
| `ActionCableManager` | Real-time WebSocket communication | `connect()`, `subscribe()`, `broadcast()` | `app/services/` | Ruby ActionCable |
| `NetworkReplyTimeout` | Network timeout management | `set()`, `handleTimeout()` | `app/helper/` | Qt Network timers |
| **Authentication & Session Management** |
| `AuthenticationService` | User login and device binding | `authenticateUser()`, `validateDevice()` | Integrated in controllers | Ruby backend auth |
| `DeviceIdentification` | Hardware UUID management | `getRKUUID()`, `getFingerprint()` | `util/rk_util.cpp` | Rockchip vendor storage |
| `SessionManager` | JWT token management | `storeToken()`, `validateSession()` | Global settings | Local storage |
| **Local Data Management** |
| `GlobalSettings` | Application configuration | `getLastTokenSignIn()`, `setPrivacyPolicies()` | Global singleton | Qt Settings |
| `UserSettings` | User preferences | `setDisplayName()`, `getGameSettings()` | User-specific config | Local file storage |
| `CacheManager` | Local content caching | `cacheGameData()`, `validateCache()` | Various controllers | Local filesystem |
| **Game & Content Management** |
| `ProductManager` | Game catalog management | `loadProducts()`, `filterByPlatform()` | `app/Data/Products/` | Ruby product APIs |
| `GameManager` | Individual game handling | `launchGame()`, `validateLicense()` | `app/Data/Products/` | CE-OS integration |
| `FlashDriveXInstaller` | Game installation system | `installGame()`, `verifyIntegrity()` | `app/FlashDriveXInstaller/` | Local filesystem |
| `LicenseManager` | DRM and licensing | `validateLicense()`, `requestKey()` | Integrated | Ruby DRM APIs |
| **Hardware Integration** |
| `GamepadManager` | Controller input handling | `detectControllers()`, `mapButtons()` | `lib/atgamesevdevgamepad/` | Linux evdev |
| `MouseManager` | Mouse/touchscreen input | `handleMouseEvents()`, `convertToKeyboard()` | `lib/atgamesevdevmouse/` | Linux input system |
| `HardwareMonitor` | Device status monitoring | `monitorTemperature()`, `checkStorage()` | Various utilities | System APIs |
| **UI & Presentation** |
| `AtGamesDialog` | Custom dialog system | `showMessage()`, `handleInput()` | `app/ui/` | Qt Widgets |
| `AtGamesListWidget` | Custom list components | `populateList()`, `handleSelection()` | `app/ui/` | Qt Widgets |
| `BackgroundAudioPlayer` | System audio management | `playMusic()`, `setVolume()` | `app/models/` | Qt Multimedia |

### **Business Logic Distribution**

| **Business Domain** | **QT-OS Responsibility** | **Backend Integration** | **Local Processing** | **Hardware Interface** |
|---------------------|--------------------------|-------------------------|----------------------|------------------------|
| **User Authentication** | UI flow, device binding | Credential validation | Token storage | Device UUID reading |
| **Game Catalog** | Display, filtering, search | Product data fetching | Caching, offline browse | Platform compatibility |
| **Game Installation** | Progress UI, file management | License validation | File download, extraction | Storage management |
| **Subscription Management** | Billing UI, plan selection | Payment processing | Status caching | None |
| **Social Features** | Friend UI, chat interface | Friend data, messaging | Local friend cache | None |
| **Leaderboards** | Score display, submission UI | Score upload/download | Local score cache | Controller input |
| **System Configuration** | Settings UI, preferences | Account sync | Local config storage | Hardware calibration |

## Network Communication Architecture

### **HTTP Client System**
```cpp
// HTTP Request Factory - Backend Communication
class HttpRequestFactory {
    // Primary backend communication
    static QNetworkRequest createD2DHttpRequest(const QString &path);
    
    // Authentication headers
    static void setD2DApiHeaders(QNetworkRequest &request);
    static void setAuthorizationHeader(QNetworkRequest &request, const QString &token);
    
    // Request debugging
    static void PrintRequest(const QNetworkRequest &request, const QByteArray &data);
};

// Network Response Handler - Error Management
class NetworkResponseHandler {
    // Response validation and error handling
    static bool handleResponse(QNetworkReply *reply, QString &result);
    static QString parseErrorMessage(const QByteArray &response);
    static void logNetworkError(QNetworkReply::NetworkError error);
};
```

**Key Integration Points**:
- **Ruby Backend APIs**: All user data, game catalog, payment processing
- **Authentication Flow**: JWT token management with device binding
- **Error Handling**: Comprehensive network error recovery
- **Timeout Management**: 30-second default timeouts with retry logic

### **Real-time Communication System**
```cpp
// ActionCable WebSocket Manager
class ActionCableManager : public QObject {
    // Real-time features
    void connectToActionCable();
    void subscribeToChannel(const QString &channel);
    void broadcastMessage(const QString &channel, const QVariantMap &data);
    
    // Connection management
    void handleConnectionLoss();
    void reconnectWithBackoff();
};
```

**Real-time Features**:
- **Live Chat**: Friend messaging and community chat
- **Notifications**: Real-time system and social notifications
- **Leaderboard Updates**: Live score updates and rank changes
- **System Messages**: Administrative announcements

## Authentication & Security Architecture

### **Device-Based Authentication System**
```cpp
// Device Identity Management
QString getRKUUID() {
    // Hardware UUID from Rockchip vendor storage
    static QString s_uuid = "8800VC000000119"; // Fallback
    
    rk_vendor_req rkvendor;
    if (0 == vendor_storage_read(1, &rkvendor)) {
        return QString::fromLocal8Bit((char*)rkvendor.data, 16);
    }
    return s_uuid;
}

// Device Fingerprinting
QString getFingerprint() {
    // Generate device-specific fingerprint
    return generateHardwareFingerprint();
}
```

**Authentication Flow Components**:
- **Hardware UUID**: Unique device identifier from vendor storage
- **Device Fingerprinting**: Additional device validation
- **User Credentials**: Legend ID + Password validation
- **JWT Token Management**: Secure session token storage

### **Session Management System**
```cpp
// Global Settings - Session Storage
class GlobalSettings {
    // Authentication tokens
    QString getLastTokenSignIn();
    void setLastTokenSignIn(const QString &token);
    
    // User session data
    QString getLastSignInID();
    void setLastSignInID(const QString &legendId);
    
    // Privacy and preferences
    bool getPrivacyPoliciesState();
    void setPrivacyPoliciesState(bool accepted);
};
```

## Local Data Management Architecture

### **Configuration Management System**
```cpp
// User Settings Management
class UserSettings {
    // Display preferences
    void setDisplayName(const QString &name);
    QString getDisplayName();
    
    // Game preferences
    void setGameVolume(int volume);
    void setControllerConfig(const GamepadConfig &config);
    
    // System preferences
    void setLanguage(const QString &language);
    void setRegion(const QString &region);
};
```

**Configuration Domains**:
- **User Preferences**: Display name, avatar, language settings
- **Game Settings**: Volume, controller configuration, display options
- **System Configuration**: Network settings, update preferences
- **Privacy Settings**: Data sharing, analytics, marketing preferences

### **Content Caching System**
```cpp
// Local Content Management
class ContentCache {
    // Game data caching
    void cacheGameMetadata(const QString &gameId, const QVariantMap &data);
    QVariantMap getCachedGameData(const QString &gameId);
    
    // Media caching
    void cacheGameArtwork(const QString &gameId, const QByteArray &imageData);
    void cacheGameVideo(const QString &gameId, const QString &videoPath);
    
    // Cache management
    void clearExpiredCache();
    qint64 getCacheSize();
};
```

## Game & Content Management Architecture

### **Product Management System**
```cpp
// Product Data Management
class Product {
    // Product information
    QString getId() const;
    QString getTitle() const;
    QString getDescription() const;
    QStringList getPlatforms() const;
    
    // Availability and pricing
    bool isAvailableInRegion(const QString &region) const;
    double getPrice(const QString &currency) const;
    bool isOwned() const;
};

// Game Management
class Game : public Product {
    // Game-specific data
    QString getGenre() const;
    QStringList getScreenshots() const;
    QString getTrailerUrl() const;
    
    // Installation and launching
    bool isInstalled() const;
    void install();
    void launch();
};
```

### **Installation & License Management**
```cpp
// FlashDriveX Installer - Game Installation System
class FlashDriveXInstaller : public QObject {
    // Installation process
    void installGame(const QString &gameId);
    void downloadGameFiles(const QString &downloadUrl);
    void extractGameArchive(const QString &archivePath);
    void validateInstallation(const QString &gameId);
    
    // License management
    void requestGameLicense(const QString &gameId);
    void validateLicense(const QString &gameId);
    void activateOfflineLicense(const QString &gameId);
    
    // Progress tracking
    void updateInstallProgress(int percentage);
    void reportInstallationComplete(const QString &gameId);
};
```

**Installation Process Flow**:
1. **License Validation**: Verify ownership and device binding
2. **Download Management**: Secure download with progress tracking
3. **File Extraction**: Game archive extraction and validation
4. **Integration**: CE-OS integration for game launching
5. **Cleanup**: Temporary file cleanup and cache management

## Hardware Integration Architecture

### **Input Device Management**
```cpp
// Gamepad Management System
class AtGamesGamepadManager : public QObject {
    // Controller detection and management
    void detectConnectedGamepads();
    void configureGamepad(int gamepadId, const GamepadConfig &config);
    void handleGamepadInput(int gamepadId, const InputEvent &event);
    
    // Button mapping
    void setButtonMapping(int gamepadId, const ButtonMapping &mapping);
    void saveGamepadConfiguration(int gamepadId);
    void loadGamepadConfiguration(int gamepadId);
};

// Mouse/Touch Input Management
class AtGamesMouseManager : public QObject {
    // Mouse event handling
    void handleMousePress(const QPoint &position);
    void handleMouseMove(const QPoint &position);
    void convertMouseToKeyboard(const QPoint &position);
    
    // Cursor management
    void showCursor();
    void hideCursor();
    void setCursorPosition(const QPoint &position);
};
```

### **System Monitoring & Management**
```cpp
// Hardware Monitoring
class HardwareMonitor : public QObject {
    // System status monitoring
    void monitorSystemTemperature();
    void checkStorageSpace();
    void monitorNetworkConnection();
    
    // Performance monitoring
    void trackCPUUsage();
    void trackMemoryUsage();
    void trackGPUPerformance();
    
    // Alert system
    void raiseSystemAlert(const QString &alertType, const QString &message);
};
```

## Business Logic Integration Points

### **Subscription Management Integration**
```cpp
// Subscription UI and Business Logic
class SubscriptionManager {
    // Subscription status
    bool hasActiveSubscription();
    QString getSubscriptionTier();
    QDateTime getSubscriptionExpiry();
    
    // Billing management
    void initiateSubscription(const QString &planId);
    void updatePaymentMethod(const PaymentMethod &method);
    void cancelSubscription();
    
    // Content access
    QStringList getSubscriptionGames();
    bool canAccessPremiumFeatures();
};
```

### **Social Features Integration**
```cpp
// Social System Management
class SocialManager {
    // Friend management
    QList<Friend> getFriendsList();
    void sendFriendRequest(const QString &legendId);
    void acceptFriendRequest(const QString &requestId);
    
    // Chat system
    void sendChatMessage(const QString &friendId, const QString &message);
    QList<ChatMessage> getChatHistory(const QString &friendId);
    
    // Leaderboards
    void submitScore(const QString &gameId, int score);
    QList<LeaderboardEntry> getLeaderboard(const QString &gameId);
};
```

## System Architecture Patterns

### **Event-Driven Architecture**
- **Qt Signal/Slot System**: Asynchronous event handling
- **Network Event Handling**: HTTP response and WebSocket message processing
- **Hardware Event Processing**: Input device and system event handling
- **UI Event Management**: User interaction and interface updates

### **Service-Oriented Design**
- **Network Services**: HTTP client and WebSocket communication
- **Authentication Services**: Login, session, and device management
- **Content Services**: Game catalog, installation, and licensing
- **Hardware Services**: Input device and system monitoring

### **Local-First Architecture**
- **Offline Capability**: Local data caching and offline mode support
- **Progressive Sync**: Background synchronization with backend services
- **Conflict Resolution**: Local vs remote data conflict handling
- **Performance Optimization**: Local caching for responsive UI

---
*QT-OS Functionality Analysis Date: 2024-12-19*
*System Type: Qt-based hardware interface application*
*Architecture: Local-first with backend integration*
*Primary Role: Device-to-cloud communication bridge*
