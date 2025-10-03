# RevenueCat Purchase Flow - Complete Guide

**How the "Subscribe" button connects to actual payments**

---

## 🔄 Complete Purchase Flow (Step-by-Step)

### 1. **User Clicks "Subscribe" Button**

**Location**: `src/components/PremiumGate.tsx` or meditation player lock screen

```tsx
<Button onClick={() => handleUpgrade()}>
  Subscribe to Peace Plan - $5.99/mo
</Button>
```

---

### 2. **Parental Gate Appears First** (COPPA Compliance)

**Why**: Federal law requires parental verification before any purchase in kids apps.

```tsx
// Automatically triggered before paywall
<ParentalGate
  isOpen={showParentalGate}
  onSuccess={() => {
    // Only after solving math problem...
    loadPaywall();
  }}
/>
```

**User sees**: "What is 7 + 4?" with input field

**Required**: User must answer correctly to proceed

---

### 3. **Paywall Loads Products from RevenueCat**

**Code flow**:
```typescript
// src/components/PremiumGate.tsx
const offerings = await getOfferings();

// offerings.current.availablePackages contains:
// [
//   { identifier: 'peace_plan', product: { price: '$5.99', priceString: '$5.99/mo' } },
//   { identifier: 'peace_plus_plan', product: { price: '$9.99', priceString: '$9.99/mo' } }
// ]
```

**Under the hood** (`src/utils/revenuecat.ts`):
```typescript
export const getOfferings = async (): Promise<PurchasesOfferings | null> => {
  if (!isNativePlatform()) {
    console.log('RevenueCat: Not native platform, skipping');
    return null;
  }

  try {
    const offerings = await Purchases.getOfferings();
    console.log('RevenueCat offerings loaded:', offerings);
    return offerings;
  } catch (error) {
    console.error('Error getting offerings:', error);
    return null;
  }
};
```

**What RevenueCat does**:
1. Contacts Apple App Store (iOS) or Google Play (Android)
2. Fetches your configured products
3. Gets localized pricing for user's region
4. Returns formatted offerings to your app

**User sees**: Two subscription cards with real pricing from stores

---

### 4. **User Selects a Plan**

```tsx
// User taps one of the subscription cards
<Button onClick={() => handlePurchase(peacePlanPackage)}>
  Subscribe for $5.99/month
</Button>
```

**Triggers**:
```typescript
const handlePurchase = async (pkg: PurchasesPackage) => {
  try {
    trackPurchaseInitiated(pkg.identifier); // Analytics
    const customerInfo = await purchasePackage(pkg);
    // Purchase succeeded!
    await handlePurchaseSuccess(customerInfo);
  } catch (error) {
    // User cancelled or error occurred
    handlePurchaseError(error);
  }
};
```

---

### 5. **RevenueCat Opens Native Payment Sheet**

**Code** (`src/utils/revenuecat.ts`):
```typescript
export const purchasePackage = async (pkg: PurchasesPackage) => {
  if (!isNativePlatform()) {
    throw new Error('Purchases only available on native platforms');
  }

  try {
    // This one line does ALL the heavy lifting:
    const { customerInfo } = await Purchases.purchasePackage(pkg);

    console.log('Purchase successful!');
    return customerInfo;
  } catch (error: any) {
    if (error.userCancelled) {
      // User tapped "Cancel" - not an error
      console.log('Purchase cancelled by user');
    } else {
      // Real error (card declined, network issue, etc.)
      console.error('Purchase failed:', error);
    }
    throw error;
  }
};
```

**What happens when `purchasePackage()` is called**:

#### On iOS:
1. **Apple payment sheet appears** (native iOS UI)
2. Shows: Product name, price, subscription terms
3. User authenticates: Face ID, Touch ID, or password
4. Apple charges their Apple ID payment method
5. Apple sends receipt to RevenueCat
6. RevenueCat validates receipt with Apple servers
7. RevenueCat returns success to your app

#### On Android:
1. **Google Play payment sheet appears** (native Android UI)
2. Shows: Product name, price, subscription terms
3. User authenticates: Fingerprint, PIN, or password
4. Google charges their Google Play payment method
5. Google sends receipt to RevenueCat
6. RevenueCat validates receipt with Google servers
7. RevenueCat returns success to your app

**You never handle**:
- ❌ Credit card numbers
- ❌ Payment processing
- ❌ Receipt validation
- ❌ Subscription renewal
- ❌ Failed payment retries

**Apple/Google/RevenueCat handle all of that automatically**

---

### 6. **Check Active Entitlements**

After purchase succeeds, your code checks what the user now has access to:

```typescript
// src/utils/syncSubscription.ts
const customerInfo = await getCustomerInfo();

// Check what entitlements are active
const activeEntitlements = customerInfo.entitlements.active;

let planType: 'free' | 'peace_plan' | 'peace_plus_plan' = 'free';

if (activeEntitlements['premium_all']) {
  // User has Peace Plus Plan ($9.99)
  planType = 'peace_plus_plan';
} else if (activeEntitlements['premium_meditations']) {
  // User has Peace Plan ($5.99)
  planType = 'peace_plan';
}
```

**Entitlement mapping**:
| RevenueCat Entitlement | Your Plan | Access |
|------------------------|-----------|--------|
| `premium_all` | `peace_plus_plan` | All meditations + courses |
| `premium_meditations` | `peace_plan` | All meditations only |
| None | `free` | Free content only |

---

### 7. **Sync Subscription to Supabase**

```typescript
// src/utils/syncSubscription.ts
export async function syncSubscriptionStatus(userId: string) {
  const customerInfo = await getCustomerInfo();
  const planType = determinePlanType(customerInfo);

  // Update database
  await supabase
    .from('user_subscriptions')
    .update({
      plan_type: planType,
      is_active: planType !== 'free',
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);

  console.log(`✅ Synced subscription: ${planType}`);
}
```

**Database update**:
```sql
-- Before purchase
user_id: 'abc123'
plan_type: 'free'
is_active: false

-- After purchase
user_id: 'abc123'
plan_type: 'peace_plan'
is_active: true
```

---

### 8. **Update App State (Zustand)**

```typescript
// src/hooks/useAuth.tsx
const subscription = await fetchSubscription(userId);

// Updates Zustand store
setSubscription({
  id: subscription.id,
  user_id: userId,
  plan_type: 'peace_plan',
  is_active: true
});
```

**Now throughout your entire app**:
```typescript
const { subscription } = useUserStore();

if (subscription?.is_active) {
  // User is premium - show all content
}
```

---

### 9. **Premium Content Unlocks**

```tsx
// src/pages/MeditationPlayer.tsx (line 47)
const isLocked = meditation && !meditation.is_free && !subscription?.is_active;

// Before purchase: isLocked = true (shows lock icon)
// After purchase:  isLocked = false (plays immediately)
```

**User experience**:
- Lock icons disappear from premium meditations
- "Premium" badges removed
- Full meditation library accessible
- Courses become available (Peace Plus Plan only)

---

## 🔗 The Configuration Chain

For this to work, you need to configure **three places**:

### 1. **App Store Connect** (Apple)
**What**: Create in-app purchase products
**When**: Oct 8 (requires Apple Developer account)

**Create these products**:
```
Product ID: peaceful_meditations_monthly
Type: Auto-renewable subscription
Duration: 1 month
Price: $5.99 (Tier 6)

Product ID: peaceful_all_monthly
Type: Auto-renewable subscription
Duration: 1 month
Price: $9.99 (Tier 11)
```

---

### 2. **Google Play Console** (Google)
**What**: Create in-app purchase products
**When**: Oct 8 (requires Google Play Developer account)

**Create these products**:
```
Product ID: peaceful_meditations_monthly
Type: Subscription
Billing period: 1 month
Price: $5.99

Product ID: peaceful_all_monthly
Type: Subscription
Billing period: 1 month
Price: $9.99
```

---

### 3. **RevenueCat Dashboard**
**What**: Link everything together
**When**: After step 1 & 2

**Configuration steps**:

1. **Add Apps**:
   - iOS app: Bundle ID `com.peacefulkids.app`
   - Android app: Package name `com.peacefulkids.app`

2. **Link Store Products**:
   ```
   iOS: peaceful_meditations_monthly → Link to App Store product
   iOS: peaceful_all_monthly → Link to App Store product
   Android: peaceful_meditations_monthly → Link to Play Store product
   Android: peaceful_all_monthly → Link to Play Store product
   ```

3. **Create Entitlements**:
   ```
   Entitlement: premium_meditations
     └─ Includes: peaceful_meditations_monthly (iOS + Android)

   Entitlement: premium_all
     └─ Includes: peaceful_all_monthly (iOS + Android)
   ```

4. **Create Offering**:
   ```
   Offering: default
     └─ Package: peace_plan ($5.99/mo)
     └─ Package: peace_plus_plan ($9.99/mo)
   ```

---

## 💰 Money Flow

```
User's credit card
    ↓
Apple/Google charges $5.99 or $9.99
    ↓
Apple/Google takes 15-30% commission
    ↓
Apple/Google pays you (monthly payout)
```

**You get**:
- First year: 70% of revenue (Apple/Google keeps 30%)
- After 1 year: 85% of revenue (commission drops to 15%)

**Example**:
- User subscribes: $5.99/month
- Apple takes: $1.80/month (first year)
- You receive: $4.19/month (first year)
- After 1 year: You receive $5.09/month

**RevenueCat is free** for the first $2,500 monthly revenue, then 1% fee.

---

## 🎯 Key Takeaways

### **You Never Build a Checkout Form**
- No credit card fields
- No payment processing code
- No PCI compliance needed
- Apple/Google handle everything

### **One Line of Code Buys Subscription**
```typescript
await Purchases.purchasePackage(package);
```
That's it! Everything else is automatic.

### **Cross-Platform Works Automatically**
- User buys on iPhone → Also works on their iPad automatically
- User buys on Android → Also works on their Android tablet
- RevenueCat syncs subscriptions across all devices

### **Subscription Management is Automatic**
- Monthly renewals: Handled by Apple/Google
- Failed payments: Apple/Google retry automatically
- Cancellations: User manages in App Store/Play Store settings
- Upgrades/downgrades: RevenueCat handles prorating

### **Your App Just Checks**
```typescript
if (hasEntitlement('premium_all')) {
  // Show premium features
}
```

That's all you need to do!

---

## 🧪 Testing Flow

### **With Placeholder Keys** (Now)
1. User clicks subscribe → Parental gate appears ✅
2. Parental gate passes → Paywall appears ✅
3. Paywall tries to load offerings → Returns null (no real products)
4. Shows: "No subscription plans available" ✅

**Code works, just no products to buy yet**

### **With Real Keys + Sandbox** (After Oct 8)
1. User clicks subscribe → Parental gate appears ✅
2. Parental gate passes → Paywall loads real products ✅
3. User selects plan → Apple/Google **SANDBOX** payment sheet ✅
4. Purchase succeeds → Subscription syncs to database ✅
5. Premium content unlocks ✅

**No real money charged - sandbox accounts are fake**

### **Production** (After launch)
Same as sandbox, but real money and real subscriptions.

---

## 📋 Setup Checklist

### Can Do Now:
- [ ] Create RevenueCat account (5 min)
- [ ] Get iOS API key: `appl_XXXXXXX`
- [ ] Get Android API key: `goog_XXXXXXX`
- [ ] Update `.env` with real keys
- [ ] Test that paywall appears (will show "no offerings" until products configured)

### Blocked Until Oct 8:
- [ ] Create Apple Developer account ($99/year)
- [ ] Create Google Play Developer account ($25 one-time)
- [ ] Configure products in App Store Connect
- [ ] Configure products in Google Play Console
- [ ] Link products in RevenueCat dashboard
- [ ] Create sandbox test accounts
- [ ] Test real purchases in sandbox mode

---

## 🆘 Common Questions

### **Q: Do I need a payment processor like Stripe?**
**A**: No! Apple and Google ARE the payment processors for mobile apps. You can't use Stripe for in-app purchases (Apple forbids it).

### **Q: What if user subscribes on web?**
**A**: Web is different - you'd use Stripe there, then manually grant entitlement in RevenueCat. But for iOS/Android apps, you MUST use Apple/Google IAP.

### **Q: How do subscription renewals work?**
**A**: Automatic! Apple/Google charge the user monthly. RevenueCat gets notified. Your database stays in sync automatically (via webhook or app launch sync).

### **Q: What if payment fails?**
**A**: Apple/Google retry automatically for several days. If it ultimately fails, they cancel the subscription and RevenueCat updates your app.

### **Q: Can users cancel anytime?**
**A**: Yes! They manage subscriptions in:
- iOS: Settings → Apple ID → Subscriptions
- Android: Play Store → Subscriptions

When they cancel, RevenueCat updates your app immediately.

### **Q: Do I get notified of new subscriptions?**
**A**: Yes! Via:
- PostHog analytics (you configured this)
- RevenueCat webhooks (optional, for server-side sync)
- Email notifications from RevenueCat

---

## 📚 References

- **This implementation**: `REVENUECAT_IMPLEMENTATION_SUMMARY.md`
- **Testing guide**: `REVENUECAT_QA_CHECKLIST.md`
- **Quick start**: `REVENUECAT_QUICK_START.md`
- **RevenueCat docs**: https://docs.revenuecat.com/
- **App Store IAP guide**: https://developer.apple.com/in-app-purchase/

---

**Next Step**: Get your RevenueCat API keys and update `.env`!
