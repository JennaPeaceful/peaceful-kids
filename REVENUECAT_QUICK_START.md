# RevenueCat Quick Start Guide

**Quick reference for getting RevenueCat working in Peaceful Kids app.**

---

## Installation (Already Complete)

```bash
npm install @revenuecat/purchases-capacitor
npx cap sync
```

✅ Plugin installed and synced to iOS/Android projects.

---

## Step 1: Get RevenueCat API Keys

1. Go to https://app.revenuecat.com
2. Create account / sign in
3. Create new project "Peaceful Kids"
4. Navigate to **API Keys** section
5. Copy:
   - **iOS (Apple) key** - starts with `appl_`
   - **Android (Google) key** - starts with `goog_`

---

## Step 2: Add API Keys to Environment

Create or update `/peaceful-kids/.env`:

```bash
# RevenueCat API Keys
VITE_REVENUECAT_IOS_KEY=appl_YOUR_ACTUAL_KEY_HERE
VITE_REVENUECAT_ANDROID_KEY=goog_YOUR_ACTUAL_KEY_HERE
```

**Important**: Replace `YOUR_ACTUAL_KEY_HERE` with real keys from Step 1.

---

## Step 3: Configure Products in App Stores

### iOS - App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Navigate to **Your App → In-App Purchases**
3. Create **Subscription Group**: "Peaceful Kids Premium"
4. Create **Auto-Renewable Subscription**:

**Product 1: Peace Plan**
- Product ID: `peaceful_meditations_monthly`
- Price: $5.99 USD
- Duration: 1 month
- Description: "Access all Kids & Adults meditations"

**Product 2: Peace Plus Plan**
- Product ID: `peaceful_all_monthly`
- Price: $9.99 USD
- Duration: 1 month
- Description: "All meditations plus exclusive courses"

5. Submit for review (required before testing)

### Android - Google Play Console

1. Go to https://play.google.com/console
2. Navigate to **Your App → Monetize → Subscriptions**
3. Create subscriptions:

**Product 1: Peace Plan**
- Product ID: `peaceful_meditations_monthly`
- Price: $5.99 USD
- Billing period: 1 month

**Product 2: Peace Plus Plan**
- Product ID: `peaceful_all_monthly`
- Price: $9.99 USD
- Billing period: 1 month

---

## Step 4: Configure RevenueCat Dashboard

1. Go to https://app.revenuecat.com
2. Navigate to **Products**
3. Add products:
   - `peaceful_meditations_monthly` (link to iOS/Android products)
   - `peaceful_all_monthly` (link to iOS/Android products)

4. Navigate to **Entitlements**
5. Create entitlements:
   - **Entitlement**: `premium_meditations` → attach product `peaceful_meditations_monthly`
   - **Entitlement**: `premium_all` → attach product `peaceful_all_monthly`

6. Navigate to **Offerings**
7. Create offering:
   - **Identifier**: `default`
   - Add both packages (monthly subscriptions)
   - Set as current offering

---

## Step 5: Test on Device

### iOS Testing

1. Create sandbox tester in App Store Connect:
   - Go to **Users and Access → Sandbox Testers**
   - Add test email (e.g., `test@peacefulkids.app`)

2. On test iPhone/iPad:
   - Sign out of production App Store
   - Install app via TestFlight
   - Attempt purchase
   - Sign in with sandbox account when prompted

### Android Testing

1. Add license testers in Google Play Console:
   - Go to **Settings → License Testing**
   - Add tester emails

2. On test Android device:
   - Install app via Internal Testing
   - Attempt purchase
   - Complete test purchase (no charge)

---

## Step 6: Run QA Tests

Use `REVENUECAT_QA_CHECKLIST.md` to verify:

✅ New purchases work (Peace Plan and Peace Plus)
✅ Restore purchases works
✅ Parental gate enforced
✅ Subscription management links work
✅ Premium content unlocks correctly

---

## Troubleshooting

### "Unable to Load Products"

**Cause**: Products not configured or offerings not set up.

**Fix**:
1. Check RevenueCat dashboard has products linked
2. Ensure "default" offering exists and is current
3. Verify products exist in App Store Connect / Play Console
4. Check API keys are correct in `.env`

### "No Purchases Found" when restoring

**Cause**: User hasn't purchased, or using different App Store/Play account.

**Fix**:
- Ensure same App Store/Play account used for purchase
- Try signing out and back into App Store/Play
- Check RevenueCat dashboard for customer

### Purchase works but premium content still locked

**Cause**: Subscription sync failed or Supabase not updated.

**Fix**:
1. Check RevenueCat dashboard - does user have active entitlement?
2. Check Supabase `user_subscriptions` table
3. Restart app (triggers sync on launch)
4. Try "Restore Purchases" button

### Simulator/Emulator issues

**Cause**: In-app purchases don't work in simulators.

**Fix**: Test on real physical device only.

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/config/revenuecat.ts` | API keys, product IDs, entitlement IDs |
| `src/utils/revenuecat.ts` | RevenueCat SDK functions (init, purchase, restore) |
| `src/utils/syncSubscription.ts` | Sync RevenueCat → Supabase |
| `src/components/PremiumGate.tsx` | Paywall UI with parental gate |
| `src/pages/Profile.tsx` | Restore purchases and manage subscription |
| `src/capacitor-init.ts` | RevenueCat initialization on app startup |

---

## Product IDs (Must Match Exactly)

| Plan | Product ID | Entitlement ID | Supabase plan_type |
|------|-----------|----------------|-------------------|
| Peace Plan ($5.99/mo) | `peaceful_meditations_monthly` | `premium_meditations` | `peace_plan` |
| Peace Plus Plan ($9.99/mo) | `peaceful_all_monthly` | `premium_all` | `peace_plus_plan` |

**Critical**: These IDs must be identical in:
- Code (`src/config/revenuecat.ts`)
- RevenueCat dashboard
- App Store Connect
- Google Play Console

---

## Support

**RevenueCat Issues**:
- Docs: https://docs.revenuecat.com
- Support: https://app.revenuecat.com/support

**App Issues**:
- Dev support: dev@peacefulkids.app
- Implementation docs: `REVENUECAT_IMPLEMENTATION_SUMMARY.md`
- QA checklist: `REVENUECAT_QA_CHECKLIST.md`

---

## Production Launch Checklist

Before App Store/Play Store submission:

- [ ] Real API keys configured in `.env` (not PLACEHOLDER)
- [ ] Products approved in App Store Connect
- [ ] Products approved in Google Play Console
- [ ] RevenueCat dashboard fully configured
- [ ] Tested on real iOS device
- [ ] Tested on real Android device
- [ ] All QA tests passed
- [ ] Parental gate tested on all flows
- [ ] Privacy policy updated (if needed)

---

**That's it! You're ready to test RevenueCat in-app purchases.**

For detailed implementation info, see `REVENUECAT_IMPLEMENTATION_SUMMARY.md`.
For comprehensive testing, see `REVENUECAT_QA_CHECKLIST.md`.
