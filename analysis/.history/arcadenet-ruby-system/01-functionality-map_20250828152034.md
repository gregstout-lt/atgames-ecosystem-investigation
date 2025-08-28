# Ruby System (arcadenet) - Complete Functionality Map

## Controller Architecture Overview

The Ruby system is organized into several major namespaces representing different business domains and API versions.

### **Core Business Domain Controllers**

| **Controller** | **Business Purpose** | **Key Actions** | **Models Used** | **External Integrations** |
|----------------|---------------------|-----------------|-----------------|---------------------------|
| **Account Management** |
| `D2d::AccountController` | Core user account operations | `show`, `update`, `avatars`, `redeem` | `Account`, `UserProfile` | None |
| `D2d::Account::RegistrationsController` | User registration & social auth | `create`, `facebook`, `google`, `atgames` | `Account`, `Identity` | Facebook, Google, AtGames OAuth |
| `D2d::Account::SessionsController` | Authentication & login | `create`, `destroy`, `validate_password` | `Account`, `Session` | None |
| `D2d::Account::DevicesController` | Hardware device management | `create`, `register`, `my`, `check` | `UserDevice`, `Account` | Hardware UUID validation |
| `D2d::Account::ConfirmationsController` | Email confirmation | `show`, `update`, `create` | `Account` | Email service |
| `D2d::Account::PasswordsController` | Password management | `create`, `update` | `Account` | Email service |
| **Commerce & Payments** |
| `D2d::Account::ShoppingCartsController` | Shopping cart management | `index`, `create`, `destroy`, `add_coupon` | `ShoppingCart`, `Coupon` | None |
| `D2d::Account::PurchasesController` | Purchase processing | `index`, `purchased_list`, `failed_payment` | `Payment`, `AccountInventory` | Payment processors |
| `D2d::StripesController` | Stripe payment processing | `pay`, `purchase`, `billing_history` | `StripePayment`, `Payment` | Stripe API |
| `D2d::PaypalsController` | PayPal payment processing | `pay`, `purchase`, `redeem` | `PaypalPayment`, `Payment` | PayPal API |
| `D2d::XsollaController` | Xsolla payment processing | `pay`, `purchase` | `XsollaPayment`, `Payment` | Xsolla API |
| `D2d::Account::WalletController` | Digital wallet & trade-ins | `index`, `trade_in` | `Credit`, `AccountInventory` | None |
| **Game Distribution** |
| `D2d::ProductsController` | Game catalog management | `findpage`, `one`, `getmedia`, `download` | `Product`, `ProductItem`, `Media` | CDN services |
| `D2d::Account::InventoriesController` | User game inventory | `index`, `genres`, `get_securom_key` | `AccountInventory`, `GameItem` | SecuROM DRM |
| `D2d::Account::StreamingController` | Cloud gaming services | `index`, `purchase`, `play`, `nodes` | `StreamingGame`, `StreamingActivity` | Cloud gaming infrastructure |
| **Subscription Services** |
| `D2d::Account::PremiumController` | Premium subscriptions | `index`, `plan_price`, `redeem_free_trial` | `PremiumSubscription`, `Plan` | Stripe subscriptions |
| `D2d::StreamingController` | Streaming subscriptions | `subscribe`, `unsubscribe`, `instant_play` | `StreamingCollection`, `StreamingActivity` | Cloud gaming |
| **Device & Hardware Integration** |
| `D2d::Arcade::V1::ProductsController` | Arcade-specific products | `findpage`, `download`, `streaming_download` | `Product`, `AtgGame` | Hardware-specific content |
| `D2d::Arcade::V1::SubscriptionsController` | Arcade subscriptions | `stripe`, `cancel_stripe`, `stripe_update_billing` | `Subscription`, `Account` | Stripe, hardware binding |
| `D2d::Arcade::V2::HardwareModelsController` | Hardware compatibility | `index` | `HardwareModel`, `AtgGameHardwareModel` | Device specifications |
| **Social & Community** |
| `D2d::Arcade::V1::LeaderboardsController` | Score tracking & tournaments | `ranking`, `upload`, `tournaments`, `party` | `Score`, `Tournament`, `Leaderboard` | Game score validation |
| `D2d::Arcade::V1::FriendRequestsController` | Friend system | `index`, `create`, `potential_friends`, `react` | `FriendRequest`, `Friendship` | Social notifications |
| `D2d::Arcade::V1::FriendsController` | Friend management | `index`, `black_list`, `react` | `Friendship`, `SocialBlockedAccount` | None |
| `D2d::Arcade::V1::ChatRoomInvitationsController` | Chat invitations | `create`, `unread`, `mark_read` | `ChatRoomInvitation` | Real-time messaging |
| `D2d::Arcade::V1::LiveStreamsController` | Live streaming | `info`, `set_shared_platform`, `make_appointment` | `LiveStreamKey`, `LiveStreamAppointment` | Streaming platforms |

### **Administrative Controllers**

| **Controller** | **Business Purpose** | **Key Actions** | **Models Used** | **Access Level** |
|----------------|---------------------|-----------------|-----------------|------------------|
| **Content Management** |
| `Api::ProductsController` | Product administration | `index`, `search_by_title`, `export_product_list` | `Product`, `ProductItem` | Admin |
| `Api::AccountsController` | Account administration | `show`, `search`, `search_by_email` | `Account`, `UserDevice` | Admin |
| `Api::CompaniesController` | Publisher management | `index`, `search_by_name`, `arcade_settings` | `Company`, `CompanyType` | Admin |
| `Api::GameKeysController` | Game key management | `index`, `show_keys`, `export_batch` | `GameKey`, `GameKeyBatch` | Admin |
| **Code Management** |
| `Api::RedeemCodeBatchesController` | Redemption code batches | `index`, `create`, `export` | `RedeemCodeBatch`, `RedeemCode` | Admin |
| `Api::RetroCodeBatchesController` | Retro game code batches | `index`, `create`, `download` | `RetroCodeBatch`, `RetroCode` | Admin |
| `Api::ByogCodeBatchesController` | BYOG code batches | `index`, `create`, `download` | `ByogCodeBatch`, `ByogCode` | Admin |
| **Analytics & Reporting** |
| `Dp::SalesController` | Sales analytics | `overview`, `sales_summary`, `best_seller` | `Payment`, `ProductItem` | Business Intelligence |
| `Api::LoggingEventsController` | System logging | `index`, `types` | `Log`, `LoggingEvent` | Admin |
| `Api::LeaderboardManagementsController` | Leaderboard admin | `q_users`, `q_scores`, `purge_scores` | `Score`, `Account` | Admin |

### **Customer Support Controllers**

| **Controller** | **Business Purpose** | **Key Actions** | **Models Used** | **Support Level** |
|----------------|---------------------|-----------------|-----------------|-------------------|
| `Cs::V1::AccountsController` | Account support | `index`, `show`, `statistic`, `restore` | `Account`, `UserDevice` | Customer Support |
| `Cs::V1::PaymentsController` | Payment support | `index`, `frauds`, `refund` | `Payment`, `LegacyPayment` | Customer Support |
| `Cs::V1::RetroCodesController` | Retro code support | `index`, `disable`, `refund`, `redeem` | `RetroCode`, `RetroCodeBatch` | Customer Support |
| `Cs::V1::ByogCodesController` | BYOG code support | `index`, `disable`, `refund`, `redeem` | `ByogCode`, `ByogCodeBatch` | Customer Support |

## Service Layer Architecture

### **Core Services** (app/services/)

| **Service** | **Business Purpose** | **Key Methods** | **Controllers Used By** | **External Dependencies** |
|-------------|---------------------|-----------------|-------------------------|---------------------------|
| **Authentication Services** |
| `AuthenticationService` | User authentication logic | `authenticate`, `validate_token` | Sessions, Registrations | OAuth providers |
| `DeviceBindingService` | Hardware device binding | `bind_device`, `validate_uuid` | Devices | Hardware UUID system |
| **Payment Services** |
| `StripeService` | Stripe payment processing | `create_payment`, `process_subscription` | Stripes, Subscriptions | Stripe API |
| `PaypalService` | PayPal payment processing | `create_payment`, `handle_webhook` | Paypals | PayPal API |
| `XsollaService` | Xsolla payment processing | `create_payment`, `handle_callback` | Xsolla | Xsolla API |
| **Content Services** |
| `ProductService` | Product management | `search_products`, `get_media`, `download_link` | Products | CDN, DRM systems |
| `InventoryService` | User inventory management | `add_to_inventory`, `validate_license` | Inventories | DRM validation |
| `StreamingService` | Cloud gaming services | `start_session`, `get_nodes`, `billing` | Streaming | Cloud infrastructure |
| **Social Services** |
| `LeaderboardService` | Score management | `submit_score`, `get_rankings`, `validate_score` | Leaderboards | Score validation |
| `FriendshipService` | Social connections | `send_request`, `accept_friend`, `block_user` | Friends, FriendRequests | Notification system |
| **Notification Services** |
| `NotificationService` | System notifications | `send_notification`, `mark_read` | Notifications | Email, push services |
| `EmailService` | Email communications | `send_confirmation`, `send_receipt` | Multiple | Email providers |

## Data Model Relationships

### **Core Entity Relationships**

| **Primary Model** | **Key Relationships** | **Business Purpose** | **Critical Fields** |
|-------------------|----------------------|---------------------|---------------------|
| `Account` | `has_many :user_devices`, `has_many :account_inventories`, `has_many :payments` | Central user entity | `email`, `legend_id`, `uuid` |
| `UserDevice` | `belongs_to :account`, `has_many :arcade_uuids` | Hardware device binding | `uuid`, `product_key`, `retailer_name` |
| `Product` | `has_many :product_items`, `has_many :account_inventories` | Game/content catalog | `title`, `publisher`, `platform` |
| `AccountInventory` | `belongs_to :account`, `belongs_to :product_item` | User's owned content | `license_key`, `download_count` |
| `Payment` | `belongs_to :account`, `has_many :transaction_product_items` | Purchase transactions | `amount`, `payment_type`, `status` |
| `Score` | `belongs_to :account`, `belongs_to :atg_game` | Leaderboard entries | `score_value`, `machine_uuid`, `verified` |
| `Friendship` | `belongs_to :account (requester)`, `belongs_to :account (friend)` | Social connections | `status`, `created_at` |

### **Business Logic Constraints**

| **Model** | **Key Validations** | **Business Rules** | **Integration Points** |
|-----------|--------------------|--------------------|------------------------|
| `Account` | Unique email, legend_id format | Max 5 devices per account | OAuth providers, device binding |
| `UserDevice` | UUID format, product key validation | One account per device UUID | Hardware vendor storage |
| `Payment` | Amount > 0, valid payment method | Refund window limits | Stripe, PayPal, Xsolla |
| `AccountInventory` | Valid license key, download limits | DRM enforcement | SecuROM, download CDN |
| `Score` | Score format, machine UUID match | Anti-cheat validation | Game clients, leaderboards |

---
*Analysis Date: 2024-12-19*
*Ruby System Version: Production (arcadenet)*
*Total Controllers Analyzed: 100+*
*Total Models Analyzed: 200+*
