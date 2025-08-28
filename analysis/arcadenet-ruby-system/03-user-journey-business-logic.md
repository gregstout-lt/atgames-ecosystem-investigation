# Ruby System (arcadenet) - User Journey Business Logic

## User Journey 1: Creating New AtGames.net Profile

### **Business Process Overview**
A new user creates an AtGames account to access games, social features, and device registration.

### **User Journey Steps**

#### Step 1: User Visits Registration Page
**User Experience**: User navigates to registration form
**Business Logic**: 
- Display registration options (email/password, social login)
- Show terms of service and privacy policy
- Validate browser compatibility and region restrictions

**Technical Implementation**: 
→ See [Technical Doc](./02-technical-business-logic.md#user-registration--authentication) - Registration Controller Section

#### Step 2: User Enters Registration Information
**User Experience**: User fills out registration form
- Email address (must be unique)
- Password (strength requirements)
- Legend ID (unique identifier for gaming)
- Accepts terms and conditions

**Business Logic**:
- Email uniqueness validation across all accounts
- Legend ID format validation (alphanumeric + special chars)
- Password strength requirements (8+ chars, mixed case, numbers)
- Terms acceptance required for account creation

**Technical Implementation**:
→ See [Technical Doc](./02-technical-business-logic.md#registration-process-d2daccountregistrationscontroller) - `create` action

#### Step 3: Account Creation and Email Confirmation
**User Experience**: User receives confirmation email
**Business Logic**:
- Account created in pending state
- Confirmation email sent with unique token
- Token expires after 24 hours
- Account remains inactive until confirmed

**Technical Implementation**:
→ See [Technical Doc](./02-technical-business-logic.md#registration-process-d2daccountregistrationscontroller) - Email confirmation system
→ See [Technical Doc](./02-technical-business-logic.md#authentication-system-d2daccountconfirmationscontroller) - Confirmation handling

#### Step 4: User Clicks Confirmation Link
**User Experience**: User clicks email link, redirected to success page
**Business Logic**:
- Validate confirmation token
- Activate account (change status from pending to active)
- Log account activation event
- Redirect to login or welcome page

**Technical Implementation**:
→ See [Technical Doc](./02-technical-business-logic.md#authentication-system-d2daccountconfirmationscontroller) - Token validation

#### Step 5: Profile Becomes Active
**User Experience**: User can now log in and access services
**Business Logic**:
- Account status changed to active
- User can authenticate and receive JWT tokens
- Access to basic services (game catalog, social features)
- Eligible for device registration

**Technical Implementation**:
→ See [Technical Doc](./02-technical-business-logic.md#authentication-system-d2daccountsessionscontroller) - Login flow

---

## User Journey 2: Device Registration and Binding

### **Business Process Overview**
User registers their AtGames hardware device to their account for game access and device-specific features.

### **User Journey Steps**

#### Step 1: User Initiates Device Registration
**User Experience**: User selects "Register Device" from device menu
**Business Logic**:
- Device must have valid product key from retailer
- Device UUID must be readable from hardware
- Account must be active and verified

**Technical Implementation**:
→ See [Technical Doc](./02-technical-business-logic.md#device-registration-d2daccountdevicescontroller) - `init_registration` action

#### Step 2: Device Information Collection
**User Experience**: System automatically detects device information
**Business Logic**:
- Read device UUID from hardware vendor storage
- Validate product key format and authenticity
- Check if device is already registered to another account
- Verify retailer code and purchase authenticity

**Technical Implementation**:
→ See [Technical Doc](./02-technical-business-logic.md#device-management-system) - Device validation logic

#### Step 3: Account Binding Process
**User Experience**: User confirms device registration
**Business Logic**:
- Bind device UUID to user account
- Create UserDevice record with registration details
- Send product registration confirmation email
- Enable device-specific content access

**Technical Implementation**:
→ See [Technical Doc](./02-technical-business-logic.md#device-registration-d2daccountdevicescontroller) - `register` action

#### Step 4: Device Authentication Setup
**User Experience**: Device can now authenticate automatically
**Business Logic**:
- Device login requires Legend ID + Password + Device UUID
- Device binding validated on each login
- Account can have maximum 5 registered devices
- Device-specific content becomes available

**Technical Implementation**:
→ See [Technical Doc](./02-technical-business-logic.md#device-management-system) - Device login flow

---

## User Journey 3: Game Purchase and Download

### **Business Process Overview**
User browses game catalog, purchases a game, and downloads it to their device.

### **User Journey Steps**

#### Step 1: Browse Game Catalog
**User Experience**: User searches and filters available games
**Business Logic**:
- Display games available in user's region
- Show pricing in user's local currency
- Filter by platform compatibility with user's devices
- Display user's ownership status for each game

**Technical Implementation**:
→ See [Technical Doc](./02-technical-business-logic.md#product-catalog-d2dproductscontroller) - `findpage` action

#### Step 2: Select Game and Add to Cart
**User Experience**: User views game details and adds to shopping cart
**Business Logic**:
- Validate game availability for user's region and devices
- Calculate pricing including taxes and regional adjustments
- Check for applicable discounts and promotional offers
- Validate user eligibility (age restrictions, content ratings)

**Technical Implementation**:
→ See [Technical Doc](./02-technical-business-logic.md#shopping-cart-system-d2daccountshoppingcartscontroller) - Cart management

#### Step 3: Checkout and Payment
**User Experience**: User proceeds through checkout flow
**Business Logic**:
- Apply any promotional codes or discounts
- Calculate final pricing with taxes
- Process payment through selected processor (Stripe/PayPal/Xsolla)
- Handle payment authentication (3D Secure, etc.)

**Technical Implementation**:
→ See [Technical Doc](./02-technical-business-logic.md#payment-processing-system) - Multi-processor payment handling

#### Step 4: Purchase Completion and License Generation
**User Experience**: User receives purchase confirmation
**Business Logic**:
- Create Payment record with transaction details
- Generate AccountInventory entry with license information
- Create secure download links with expiration
- Send purchase receipt email

**Technical Implementation**:
→ See [Technical Doc](./02-technical-business-logic.md#payment-processing-system) - Purchase completion flow
→ See [Technical Doc](./02-technical-business-logic.md#user-inventory-system-d2daccountinventoriescontroller) - License generation

#### Step 5: Game Download and Installation
**User Experience**: User downloads and installs game on device
**Business Logic**:
- Validate ownership before providing download links
- Generate time-limited, signed download URLs
- Track download attempts and enforce limits
- Provide DRM keys for protected content

**Technical Implementation**:
→ See [Technical Doc](./02-technical-business-logic.md#product-catalog-d2dproductscontroller) - `download` action
→ See [Technical Doc](./02-technical-business-logic.md#user-inventory-system-d2daccountinventoriescontroller) - `get_securom_key` action

---

## User Journey 4: Subscription Management

### **Business Process Overview**
User subscribes to premium services for enhanced game access and features.

### **User Journey Steps**

#### Step 1: View Subscription Options
**User Experience**: User browses available subscription tiers
**Business Logic**:
- Display subscription options based on user's region and devices
- Show pricing in local currency with tax calculations
- Display trial availability and terms
- Show current subscription status if applicable

**Technical Implementation**:
→ See [Technical Doc](./02-technical-business-logic.md#premium-subscriptions-d2daccountpremiumcontroller) - `plan_price` action

#### Step 2: Select Subscription and Payment Method
**User Experience**: User chooses subscription tier and payment method
**Business Logic**:
- Validate subscription eligibility
- Check for trial period availability
- Collect payment method information
- Calculate pro-ration for existing subscriptions

**Technical Implementation**:
→ See [Technical Doc](./02-technical-business-logic.md#arcade-specific-subscriptions-d2darcadev1subscriptionscontroller) - Subscription creation

#### Step 3: Subscription Activation
**User Experience**: Subscription becomes active immediately or after trial
**Business Logic**:
- Create subscription record with billing cycle
- Activate premium content access
- Set up recurring billing schedule
- Send subscription confirmation email

**Technical Implementation**:
→ See [Technical Doc](./02-technical-business-logic.md#subscription-system) - Subscription activation flow

#### Step 4: Ongoing Subscription Management
**User Experience**: User can view usage, change plans, or cancel
**Business Logic**:
- Track subscription usage and billing cycles
- Handle plan upgrades/downgrades with pro-ration
- Process cancellation requests (immediate vs end-of-period)
- Manage payment method updates and failed payments

**Technical Implementation**:
→ See [Technical Doc](./02-technical-business-logic.md#arcade-specific-subscriptions-d2darcadev1subscriptionscontroller) - Subscription management actions

---

## User Journey 5: Social Features and Leaderboards

### **Business Process Overview**
User engages with social features including friends, leaderboards, and community interactions.

### **User Journey Steps**

#### Step 1: Connect with Friends
**User Experience**: User searches for and adds friends
**Business Logic**:
- Search users by Legend ID or display name
- Send friend requests with privacy controls
- Handle friend request responses (accept/decline/block)
- Suggest potential friends based on gaming patterns

**Technical Implementation**:
→ See [Technical Doc](./02-technical-business-logic.md#friend-system-d2darcadev1friendscontroller) - Friend management
→ See [Technical Doc](./02-technical-business-logic.md#friend-requests-d2darcadev1friendrequestscontroller) - Friend request handling

#### Step 2: Submit Game Scores
**User Experience**: User plays games and scores are automatically submitted
**Business Logic**:
- Validate score submissions against anti-cheat systems
- Verify machine UUID matches registered device
- Update personal best and global rankings
- Trigger notifications for achievements and rank changes

**Technical Implementation**:
→ See [Technical Doc](./02-technical-business-logic.md#leaderboard-system-d2darcadev1leaderboardscontroller) - Score submission and validation

#### Step 3: View Leaderboards and Compete
**User Experience**: User views rankings and competes with friends
**Business Logic**:
- Display multiple leaderboard views (global, friends, community)
- Show rank changes and achievement notifications
- Handle tournament participation and special events
- Maintain leaderboard integrity with anti-cheat measures

**Technical Implementation**:
→ See [Technical Doc](./02-technical-business-logic.md#leaderboard-system-d2darcadev1leaderboardscontroller) - Ranking and tournament systems

---

## User Journey 6: Customer Support Interactions

### **Business Process Overview**
User encounters issues and interacts with customer support for resolution.

### **User Journey Steps**

#### Step 1: User Reports Issue
**User Experience**: User contacts support through various channels
**Business Logic**:
- Capture issue details and account information
- Categorize issue type (payment, technical, account)
- Create support ticket with priority level
- Route to appropriate support team

**Technical Implementation**:
→ See [Technical Doc](./02-technical-business-logic.md#account-support-csv1accountscontroller) - Support case creation

#### Step 2: Support Investigation
**User Experience**: Support agent investigates user's account and history
**Business Logic**:
- Access comprehensive account information
- Review purchase history and payment details
- Check device registrations and technical logs
- Identify potential solutions and escalation needs

**Technical Implementation**:
→ See [Technical Doc](./02-technical-business-logic.md#account-support-csv1accountscontroller) - Account investigation tools
→ See [Technical Doc](./02-technical-business-logic.md#payment-support-csv1paymentscontroller) - Payment investigation

#### Step 3: Issue Resolution
**User Experience**: Support provides solution (refund, account fix, etc.)
**Business Logic**:
- Process refunds through original payment method
- Restore account access or fix account issues
- Update account flags and support history
- Send resolution confirmation to user

**Technical Implementation**:
→ See [Technical Doc](./02-technical-business-logic.md#payment-support-csv1paymentscontroller) - Refund processing
→ See [Technical Doc](./02-technical-business-logic.md#account-support-csv1accountscontroller) - Account restoration

---

## Cross-Journey Integration Points

### **Authentication State Management**
- All journeys require active, authenticated user session
- JWT tokens manage session state across all interactions
- Device binding affects available features and content

### **Payment and Billing Integration**
- Purchase journeys integrate with subscription status
- Wallet credits can be applied across different purchase types
- Payment method management affects all commerce interactions

### **Social and Community Features**
- Friend connections enhance leaderboard experiences
- Social features integrate with game purchase recommendations
- Community participation affects content discovery

### **Customer Support Integration**
- Support can access and modify data from all user journeys
- Administrative actions are logged and auditable
- Support interactions affect user experience across all features

---
*User Journey Analysis Date: 2024-12-19*
*Ruby System: Complete business process documentation*
*Integration Points: Cross-referenced with technical implementation*
