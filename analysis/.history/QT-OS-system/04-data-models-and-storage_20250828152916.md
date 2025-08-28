# QT-OS System - Data Models and Storage Analysis

## Local Data Architecture Overview

The QT-OS system employs a **local-first data architecture** with selective synchronization to the Ruby backend. Data is stored locally using Qt's configuration system, file-based storage, and in-memory caches for optimal performance.

## Configuration Storage Models

### **Global System Configuration**
**Storage**: Qt QSettings (system-wide configuration file)
**Location**: `/etc/atgames/system.conf` (Linux) or Registry (Windows)

```cpp
// Global Settings Data Model
class GlobalSettings {
private:
    QSettings *systemConfig;
    
public:
    // Authentication and Session Data
    struct AuthenticationData {
        QString lastTokenSignIn;        // JWT authentication token
        QString lastSignInID;          // Last used Legend ID
        QDateTime tokenExpiration;     // Token expiry timestamp
        QString deviceFingerprint;     // Hardware fingerprint
        bool rememberCredentials;      // User preference
    };
    
    // Privacy and Compliance Data
    struct PrivacySettings {
        bool privacyPoliciesAccepted;  // GDPR/privacy policy acceptance
        bool analyticsEnabled;         // Usage analytics opt-in
        bool marketingEnabled;         // Marketing communications opt-in
        QDateTime privacyPolicyVersion; // Version of accepted policy
        QString dataProcessingConsent; // Specific consent details
    };
    
    // System Configuration Data
    struct SystemConfig {
        QString firmwareVersion;       // Current firmware version
        QString appVersion;           // QT-OS application version
        QString hardwareModel;        // Device hardware model
        QString regionCode;           // Geographic region
        QString languageCode;         // Interface language
        bool debugModeEnabled;        // Development/debug mode
    };
    
    // Network Configuration Data
    struct NetworkConfig {
        QString apiServerUrl;         // Backend API server URL
        QString cdnServerUrl;         // Content delivery network URL
        int connectionTimeout;        // Network timeout settings
        bool useSSLValidation;       // SSL certificate validation
        QString proxySettings;       // Network proxy configuration
    };
};
```

### **User-Specific Configuration**
**Storage**: Qt QSettings (user-specific configuration file)
**Location**: `~/.config/atgames/user_${legend_id}.conf`

```cpp
// User Settings Data Model
class UserSettings {
private:
    QSettings *userConfig;
    QString currentUserId;
    
public:
    // User Profile Data
    struct UserProfile {
        QString legendId;             // User's Legend ID
        QString displayName;          // Display name for UI
        QString email;               // User's email address
        QString avatarUrl;           // Profile avatar URL
        QDateTime lastLoginTime;     // Last successful login
        QString preferredLanguage;   // User's language preference
        QString timezone;            // User's timezone
    };
    
    // Game Preferences Data
    struct GamePreferences {
        int masterVolume;            // Global volume setting (0-100)
        int musicVolume;             // Background music volume
        int effectsVolume;           // Sound effects volume
        bool subtitlesEnabled;       // Subtitle display preference
        QString subtitleLanguage;    // Subtitle language
        int difficultyPreference;    // Default difficulty setting
        bool autoSaveEnabled;        // Automatic save preference
    };
    
    // Controller Configuration Data
    struct ControllerConfig {
        QMap<int, int> buttonMapping;     // Button remapping
        double analogSensitivity;         // Analog stick sensitivity
        double triggerDeadzone;          // Trigger deadzone setting
        bool vibrationEnabled;           // Controller vibration
        int vibrationStrength;           // Vibration intensity (0-100)
        QString controllerProfile;       // Named controller profile
    };
    
    // Display and UI Preferences
    struct DisplaySettings {
        QString screenResolution;        // Display resolution
        bool fullscreenMode;            // Fullscreen vs windowed
        int brightnessLevel;            // Screen brightness (0-100)
        bool screenSaverEnabled;        // Screen saver activation
        int screenSaverTimeout;         // Screen saver timeout (minutes)
        QString uiTheme;               // UI theme/skin selection
    };
};
```

## Local Game Data Models

### **Game Installation Registry**
**Storage**: JSON file-based registry
**Location**: `~/.local/share/atgames/games/registry.json`

```cpp
// Game Installation Data Model
class GameRegistry {
private:
    QJsonDocument registryDocument;
    QString registryFilePath;
    
public:
    // Individual Game Installation Record
    struct GameInstallation {
        QString gameId;                  // Unique game identifier
        QString title;                   // Game title
        QString version;                 // Installed game version
        QString installPath;             // Installation directory path
        qint64 installSize;             // Installation size in bytes
        QDateTime installDate;          // Installation timestamp
        QDateTime lastPlayed;           // Last played timestamp
        int playCount;                  // Number of times played
        qint64 totalPlayTime;           // Total play time in seconds
        bool isValid;                   // Installation integrity status
        QString licenseKey;             // Local license key cache
        QStringList requiredFiles;      // Critical game files list
        QString gameExecutable;         // Main game executable path
        QVariantMap gameMetadata;       // Additional game-specific data
    };
    
    // Installation Status Tracking
    enum InstallationStatus {
        NotInstalled,
        Downloading,
        Installing,
        Installed,
        UpdateAvailable,
        Corrupted,
        Uninstalling
    };
    
    // Game Library Management
    QList<GameInstallation> getInstalledGames();
    GameInstallation getGameInstallation(const QString &gameId);
    void updateGameInstallation(const GameInstallation &installation);
    void removeGameInstallation(const QString &gameId);
    
    // Installation Validation
    bool validateGameInstallation(const QString &gameId);
    QStringList findCorruptedGames();
    qint64 getTotalInstallationSize();
};
```

### **Game Content Cache**
**Storage**: File-based cache with metadata index
**Location**: `~/.cache/atgames/games/`

```cpp
// Game Content Cache Data Model
class GameContentCache {
private:
    QString cacheDirectory;
    QJsonDocument cacheIndex;
    
public:
    // Cached Game Metadata
    struct CachedGameData {
        QString gameId;                 // Game identifier
        QString title;                  // Game title
        QString description;            // Game description
        QStringList genres;             // Game genres
        QString publisher;              // Game publisher
        QString developer;              // Game developer
        QDateTime releaseDate;          // Game release date
        double rating;                  // User rating (0.0-5.0)
        int ratingCount;               // Number of ratings
        QStringList platforms;          // Supported platforms
        QVariantMap systemRequirements; // System requirements
        QDateTime cacheTimestamp;       // Cache creation time
        QDateTime expirationTime;       // Cache expiration time
    };
    
    // Cached Media Assets
    struct CachedMediaAssets {
        QString gameId;                 // Game identifier
        QStringList screenshots;        // Screenshot file paths
        QString trailerVideo;           // Trailer video file path
        QString iconImage;             // Game icon file path
        QString bannerImage;           // Banner image file path
        QString backgroundImage;       // Background image file path
        qint64 totalMediaSize;         // Total media size in bytes
        QDateTime lastUpdated;         // Last media update time
    };
    
    // Cache Management Operations
    void cacheGameData(const QString &gameId, const CachedGameData &data);
    CachedGameData getCachedGameData(const QString &gameId);
    void cacheMediaAsset(const QString &gameId, const QString &assetType, const QByteArray &data);
    QString getCachedMediaPath(const QString &gameId, const QString &assetType);
    
    // Cache Maintenance
    void cleanExpiredCache();
    void clearGameCache(const QString &gameId);
    qint64 getCacheSize();
    void setCacheLimit(qint64 maxSizeBytes);
};
```

## User Data Models

### **Local User Inventory**
**Storage**: Encrypted JSON file
**Location**: `~/.local/share/atgames/users/${legend_id}/inventory.enc`

```cpp
// User Inventory Data Model
class UserInventory {
private:
    QJsonDocument inventoryDocument;
    QString encryptionKey;
    
public:
    // Owned Game Record
    struct OwnedGame {
        QString gameId;                 // Game identifier
        QString title;                  // Game title
        QDateTime purchaseDate;         // Purchase timestamp
        QString purchaseType;           // "purchase", "subscription", "rental"
        QDateTime expirationDate;       // Expiration (for rentals/subscriptions)
        QString licenseType;           // License type (full, demo, trial)
        bool isDownloadable;           // Can be downloaded
        int downloadCount;             // Number of downloads used
        int maxDownloads;              // Maximum allowed downloads
        QString purchaseReceipt;       // Purchase receipt/transaction ID
        double purchasePrice;          // Amount paid
        QString currency;              // Purchase currency
        bool isRefundable;             // Refund eligibility
        QDateTime refundDeadline;      // Refund deadline
    };
    
    // Subscription Status
    struct SubscriptionStatus {
        QString subscriptionId;         // Subscription identifier
        QString planName;              // Subscription plan name
        QString tier;                  // Subscription tier (basic, premium, etc.)
        QDateTime startDate;           // Subscription start date
        QDateTime endDate;             // Subscription end date
        QDateTime nextBillingDate;     // Next billing date
        bool autoRenew;               // Auto-renewal status
        QString paymentMethod;         // Payment method on file
        QStringList includedGames;     // Games included in subscription
        QStringList bonusFeatures;    // Additional features included
        bool isActive;                // Current subscription status
    };
    
    // Digital Wallet
    struct DigitalWallet {
        double creditBalance;           // Available credit balance
        QString currency;              // Currency code
        QList<CreditTransaction> transactions; // Transaction history
        QDateTime lastUpdated;         // Last balance update
    };
    
    struct CreditTransaction {
        QString transactionId;          // Transaction identifier
        QDateTime timestamp;           // Transaction timestamp
        double amount;                 // Transaction amount (positive/negative)
        QString type;                  // "purchase", "refund", "trade_in", "bonus"
        QString description;           // Transaction description
        QString relatedGameId;         // Related game (if applicable)
    };
};
```

### **Social Data Cache**
**Storage**: JSON file with periodic sync
**Location**: `~/.cache/atgames/social/`

```cpp
// Social Data Cache Model
class SocialDataCache {
private:
    QString cacheDirectory;
    QJsonDocument friendsCache;
    QJsonDocument leaderboardCache;
    
public:
    // Friend Information
    struct FriendData {
        QString legendId;               // Friend's Legend ID
        QString displayName;            // Friend's display name
        QString avatarUrl;             // Friend's avatar URL
        bool isOnline;                 // Online status
        QDateTime lastSeen;            // Last seen timestamp
        QString currentGame;           // Currently playing game
        int friendshipLevel;           // Friendship level/score
        QDateTime friendSince;         // Friendship start date
        bool canSendMessages;          // Messaging permission
        bool shareGameActivity;        // Activity sharing permission
    };
    
    // Leaderboard Entry
    struct LeaderboardEntry {
        QString gameId;                // Game identifier
        QString legendId;              // Player's Legend ID
        QString displayName;           // Player's display name
        int score;                     // Player's score
        int rank;                      // Player's rank
        QDateTime achievedDate;        // Score achievement date
        QString scoreType;             // Score type (high_score, time, etc.)
        bool isPersonalBest;          // Personal best indicator
        bool isFriend;                // Friend indicator
    };
    
    // Chat Message
    struct ChatMessage {
        QString messageId;             // Message identifier
        QString senderId;              // Sender's Legend ID
        QString recipientId;           // Recipient's Legend ID
        QString messageText;           // Message content
        QDateTime timestamp;           // Message timestamp
        bool isRead;                  // Read status
        QString messageType;          // "text", "emoji", "system"
        QVariantMap metadata;         // Additional message data
    };
    
    // Social Cache Operations
    void cacheFriendsList(const QList<FriendData> &friends);
    QList<FriendData> getCachedFriends();
    void cacheLeaderboard(const QString &gameId, const QList<LeaderboardEntry> &entries);
    QList<LeaderboardEntry> getCachedLeaderboard(const QString &gameId);
    void cacheChatMessages(const QString &conversationId, const QList<ChatMessage> &messages);
    QList<ChatMessage> getCachedMessages(const QString &conversationId);
};
```

## System Data Models

### **Hardware Configuration Data**
**Storage**: System configuration files
**Location**: `/etc/atgames/hardware/`

```cpp
// Hardware Configuration Model
class HardwareConfig {
private:
    QSettings *hardwareSettings;
    
public:
    // Device Hardware Information
    struct DeviceInfo {
        QString deviceUUID;            // Hardware UUID from vendor storage
        QString hardwareModel;         // Device model identifier
        QString firmwareVersion;       // Current firmware version
        QString serialNumber;          // Device serial number
        QString manufacturingDate;     // Manufacturing date
        QString retailerCode;          // Retailer identifier
        QString productKey;           // Product registration key
        QDateTime registrationDate;    // Device registration timestamp
        QString boundAccountId;       // Bound user account
    };
    
    // Input Device Configuration
    struct InputDeviceConfig {
        QString devicePath;            // Input device system path
        QString deviceName;            // Human-readable device name
        QString deviceType;            // "gamepad", "keyboard", "mouse"
        QMap<int, int> buttonMapping;  // Button mapping configuration
        double sensitivity;            // Input sensitivity
        double deadzone;              // Analog deadzone
        bool isEnabled;               // Device enabled status
        QString driverVersion;        // Device driver version
    };
    
    // System Performance Data
    struct SystemPerformance {
        double cpuUsage;              // Current CPU usage percentage
        qint64 memoryUsage;           // Current memory usage in bytes
        qint64 totalMemory;           // Total system memory in bytes
        double temperature;           // System temperature in Celsius
        qint64 storageUsed;           // Used storage space in bytes
        qint64 storageTotal;          // Total storage space in bytes
        QString networkStatus;        // Network connectivity status
        double networkSpeed;          // Network speed in Mbps
    };
};
```

### **Application State Management**
**Storage**: Runtime memory with periodic persistence
**Location**: Memory + `/tmp/atgames/state/`

```cpp
// Application State Model
class ApplicationState {
private:
    QVariantMap currentState;
    QString stateFilePath;
    
public:
    // UI Navigation State
    struct NavigationState {
        QString currentPage;           // Current UI page/screen
        QString previousPage;          // Previous UI page
        QStringList navigationHistory; // Navigation history stack
        QVariantMap pageParameters;   // Current page parameters
        QString activeDialog;         // Active dialog/popup
        bool isFullscreen;            // Fullscreen mode status
    };
    
    // Game Session State
    struct GameSessionState {
        QString currentGameId;         // Currently running game
        QDateTime sessionStartTime;    // Game session start time
        bool isGameRunning;           // Game execution status
        QString gameState;            // Game state ("playing", "paused", "menu")
        QVariantMap gameProgress;     // Game-specific progress data
        int currentLevel;             // Current game level
        int score;                    // Current game score
        QDateTime lastSaveTime;       // Last save timestamp
    };
    
    // Network Connection State
    struct NetworkState {
        bool isConnected;             // Internet connectivity status
        QString connectionType;       // "wifi", "ethernet", "none"
        QString networkName;          // Connected network name
        int signalStrength;           // WiFi signal strength (0-100)
        QDateTime lastConnected;      // Last connection timestamp
        bool isAuthenticated;         // Backend authentication status
        QString authToken;            // Current authentication token
        QDateTime tokenExpiration;    // Token expiration time
    };
    
    // System Resource State
    struct ResourceState {
        QList<QString> runningProcesses;    // Active system processes
        QMap<QString, qint64> memoryUsage;  // Memory usage by component
        QMap<QString, double> cpuUsage;     // CPU usage by component
        qint64 availableStorage;           // Available storage space
        bool isLowMemory;                  // Low memory warning status
        bool isLowStorage;                 // Low storage warning status
        double batteryLevel;               // Battery level (if applicable)
    };
};
```

## Data Persistence Strategies

### **Configuration Persistence**
- **Qt QSettings**: System and user configuration using platform-native storage
- **Atomic Writes**: Configuration changes written atomically to prevent corruption
- **Backup Strategy**: Automatic backup of critical configuration files
- **Migration Support**: Version-aware configuration migration for updates

### **Cache Management**
- **LRU Eviction**: Least Recently Used cache eviction for memory management
- **Size Limits**: Configurable cache size limits with automatic cleanup
- **Expiration Policies**: Time-based cache expiration for data freshness
- **Integrity Validation**: Cache integrity checking with automatic repair

### **Data Synchronization**
- **Selective Sync**: Only modified data synchronized with backend
- **Conflict Resolution**: Local vs remote data conflict resolution strategies
- **Offline Support**: Full offline operation with deferred synchronization
- **Incremental Updates**: Delta synchronization for efficiency

### **Security and Encryption**
- **Sensitive Data Encryption**: User credentials and payment data encrypted at rest
- **Key Management**: Secure key derivation and storage for encryption
- **Data Sanitization**: Secure deletion of sensitive data when required
- **Access Control**: File system permissions for data protection

---
*QT-OS Data Models Analysis Date: 2024-12-19*
*Storage Architecture: Local-first with selective backend synchronization*
*Data Security: Encryption for sensitive data, secure key management*
*Performance: Caching strategies for responsive user experience*
