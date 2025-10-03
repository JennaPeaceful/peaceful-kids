# RevenueCat In-App Purchase QA Testing Checklist

This comprehensive testing guide covers all critical scenarios for the RevenueCat IAP implementation in the Peaceful Kids mobile app.

## Prerequisites

Before testing, ensure you have:

- [ ] RevenueCat account with project configured
- [ ] Real API keys added to `.env` (replace PLACEHOLDER values)
- [ ] Products configured in RevenueCat dashboard:
  - Product ID: `peaceful_meditations_monthly` (Peace Plan)
  - Product ID: `peaceful_all_monthly` (Peace Plus Plan)
  - Entitlement ID: `premium_meditations`
  - Entitlement ID: `premium_all`
  - Default offering created with both packages
- [ ] Products configured in App Store Connect (iOS)
- [ ] Products configured in Google Play Console (Android)
- [ ] iOS sandbox test account created
- [ ] Android test account added to testers list
- [ ] Test build installed on physical device (purchases don't work in simulator)

---

## Page 1: Core Purchase Flows

### Test 1: New Purchase Flow - Peace Plan

**Objective**: Verify new user can purchase Peace Plan subscription

**Steps**:
1. Install fresh build on test device
2. Sign in or create new account (no existing subscription)
3. Navigate to locked premium meditation
4. Tap "Upgrade to Premium" button
5. **VERIFY**: Parental gate appears
6. Solve math problem correctly
7. **VERIFY**: Paywall appears with both plans
8. **VERIFY**: Peace Plan shows correct price ($5.99/month)
9. **VERIFY**: Features listed correctly (meditations, tracking, ad-free)
10. Tap Peace Plan card
11. **VERIFY**: Native payment sheet appears (iOS/Android)
12. Complete purchase using sandbox credentials
13. **VERIFY**: Success toast appears
14. **VERIFY**: Syncing message appears
15. **VERIFY**: "Welcome to Premium!" toast appears
16. **VERIFY**: Locked meditation now unlocked and plays
17. Go to Profile page
18. **VERIFY**: Shows "Premium Member" badge
19. **VERIFY**: Shows "Peace Plan" as current plan
20. **VERIFY**: Plan status shows "Active"

**Expected Results**:
- ✅ Purchase completes successfully
- ✅ Entitlement granted immediately
- ✅ Supabase `user_subscriptions` updated with `plan_type: 'peace_plan'`, `is_active: true`
- ✅ Premium content accessible
- ✅ Profile reflects premium status

**Failure Scenarios to Test**:
- Cancel purchase → Should return to paywall without error
- Network error during purchase → Should show error toast
- Payment method declined → Should show native payment error

---

### Test 2: New Purchase Flow - Peace Plus Plan

**Objective**: Verify new user can purchase Peace Plus Plan subscription

**Steps**:
1. Fresh install, new account
2. Navigate to locked premium meditation
3. Pass parental gate
4. **VERIFY**: Peace Plus Plan shows "Best Value" badge
5. **VERIFY**: Shows correct price ($9.99/month)
6. **VERIFY**: Shows all features including courses
7. Tap Peace Plus Plan card
8. Complete purchase using sandbox credentials
9. **VERIFY**: Success and sync messages appear
10. **VERIFY**: All premium content accessible (meditations + courses)
11. Check Profile page
12. **VERIFY**: Shows "Peace Plus Plan" as current plan

**Expected Results**:
- ✅ Purchase completes successfully
- ✅ Higher tier entitlement granted
- ✅ Supabase updated with `plan_type: 'peace_plus_plan'`, `is_active: true`
- ✅ All premium content (meditations AND courses) accessible

---

### Test 3: Parental Gate Enforcement

**Objective**: Verify parental gate cannot be bypassed

**Steps**:
1. Navigate to any upgrade path
2. **VERIFY**: Parental gate appears BEFORE paywall
3. Enter incorrect answer
4. **VERIFY**: Error message appears
5. **VERIFY**: Paywall does NOT appear
6. Enter correct answer
7. **VERIFY**: Paywall appears AFTER correct answer
8. Try accessing paywall through different routes:
   - Premium meditation lock screen
   - Profile "Upgrade to Premium" button
   - Explore page premium banner (if exists)
9. **VERIFY**: Parental gate appears in ALL cases before paywall

**Expected Results**:
- ✅ Parental gate required for all upgrade paths
- ✅ Cannot bypass gate with incorrect answer
- ✅ Cannot access paywall without solving gate
- ✅ COPPA compliance maintained

---

### Test 4: Restore Purchases - Existing Subscription

**Objective**: Verify user can restore previous purchase

**Setup**: Complete Test 1 or Test 2 first to create active subscription

**Steps**:
1. Sign out from app
2. Delete app from device
3. Reinstall app from TestFlight/Internal Testing
4. Sign in with SAME account used in setup
5. Go to Profile page
6. **VERIFY**: "Restore Purchases" button visible (native only)
7. Tap "Restore Purchases"
8. **VERIFY**: Loading spinner appears on button
9. **VERIFY**: "Restoring Purchases" toast appears
10. Wait for completion
11. **VERIFY**: "Purchases Restored!" toast appears
12. **VERIFY**: Shows correct plan type (Peace/Peace Plus)
13. Navigate to previously locked meditation
14. **VERIFY**: Meditation is unlocked and plays
15. Check Profile
16. **VERIFY**: Premium status restored
17. **VERIFY**: Correct plan displayed

**Expected Results**:
- ✅ Purchases restored successfully
- ✅ Entitlements recognized from App Store/Play Store
- ✅ Supabase synced with restored subscription
- ✅ All premium content accessible
- ✅ No repurchase required

---

### Test 5: Restore Purchases - No Previous Purchase

**Objective**: Verify graceful handling when no purchases exist

**Steps**:
1. Fresh install, new account (NO previous purchases)
2. Go to Profile page
3. Tap "Restore Purchases"
4. **VERIFY**: "Restoring Purchases" toast appears
5. **VERIFY**: "No Purchases Found" toast appears
6. **VERIFY**: User remains on free plan
7. **VERIFY**: No error state or crash

**Expected Results**:
- ✅ Clear messaging that no purchases were found
- ✅ No error crashes
- ✅ User can still proceed to purchase

---

### Test 6: Cross-Device Subscription Recognition

**Objective**: Verify subscription works across multiple devices with same account

**Setup**: Complete purchase on Device A

**Steps**:
1. Device A: Complete Test 1 (purchase Peace Plan)
2. Device B: Install app
3. Device B: Sign in with SAME Apple ID/Google Account
4. Device B: Sign in with SAME app account
5. Device B: Go to Profile
6. Device B: Tap "Restore Purchases"
7. **VERIFY**: Device B recognizes subscription
8. **VERIFY**: Premium content unlocked on Device B
9. Device B: Check Profile
10. **VERIFY**: Shows premium status and correct plan

**Expected Results**:
- ✅ Subscription transfers across devices
- ✅ RevenueCat recognizes same App Store/Play Store account
- ✅ Supabase syncs correctly
- ✅ Premium access granted on all devices

---

## Page 2: Advanced Scenarios & Edge Cases

### Test 7: Manage Subscription Links

**Objective**: Verify subscription management opens correct platform page

**iOS Steps**:
1. Complete purchase on iOS device
2. Go to Profile page
3. **VERIFY**: "Manage Subscription" button visible
4. Tap "Manage Subscription"
5. **VERIFY**: Opens iOS Settings → Subscriptions page
6. **VERIFY**: Shows Peaceful Kids subscription
7. **VERIFY**: Can view/cancel subscription from iOS Settings

**Android Steps**:
1. Complete purchase on Android device
2. Go to Profile page
3. **VERIFY**: "Manage Subscription" button visible
4. Tap "Manage Subscription"
5. **VERIFY**: Opens Google Play subscription management
6. **VERIFY**: Shows Peaceful Kids subscription
7. **VERIFY**: Can view/cancel subscription from Play Store

**Expected Results**:
- ✅ iOS: Opens to App Store subscription page
- ✅ Android: Opens to Google Play subscription page
- ✅ Subscription visible and manageable
- ✅ Fallback to web URL if native fails

---

### Test 8: Entitlement Mapping Verification

**Objective**: Verify correct products unlock correct features

**Peace Plan Tests**:
1. Purchase Peace Plan ($5.99/month)
2. **VERIFY**: Product ID is `peaceful_meditations_monthly`
3. **VERIFY**: Entitlement ID is `premium_meditations`
4. **VERIFY**: All Kids meditations unlocked
5. **VERIFY**: All Adults meditations unlocked
6. **VERIFY**: Highly Meditated course LOCKED (Plus only)
7. **VERIFY**: Rainbow Array course LOCKED (Plus only)
8. Check Supabase `user_subscriptions`
9. **VERIFY**: `plan_type: 'peace_plan'`
10. **VERIFY**: `is_active: true`

**Peace Plus Plan Tests**:
1. Purchase Peace Plus Plan ($9.99/month)
2. **VERIFY**: Product ID is `peaceful_all_monthly`
3. **VERIFY**: Entitlement ID is `premium_all`
4. **VERIFY**: All Kids meditations unlocked
5. **VERIFY**: All Adults meditations unlocked
6. **VERIFY**: Highly Meditated course UNLOCKED
7. **VERIFY**: Rainbow Array course UNLOCKED
8. Check Supabase `user_subscriptions`
9. **VERIFY**: `plan_type: 'peace_plus_plan'`
10. **VERIFY**: `is_active: true`

**Expected Results**:
- ✅ Product IDs match exactly as specified
- ✅ Entitlement IDs match exactly as specified
- ✅ Peace Plan grants meditation access only
- ✅ Peace Plus grants meditation + course access
- ✅ Supabase plan types mapped correctly

---

### Test 9: Receipt Validation Delays

**Objective**: Verify app handles async receipt processing gracefully

**Steps**:
1. Complete purchase in area with poor network
2. **VERIFY**: Purchase completes via native payment
3. **VERIFY**: App shows "Syncing..." message
4. Wait for receipt validation (may take 5-30 seconds)
5. **VERIFY**: Eventually shows "Welcome to Premium!"
6. If timeout occurs:
   - Close and reopen app
   - **VERIFY**: Subscription recognized on app launch
7. Test offline scenario:
   - Enable airplane mode
   - Complete purchase
   - **VERIFY**: Shows pending/syncing state
   - Disable airplane mode
   - **VERIFY**: Sync completes automatically

**Expected Results**:
- ✅ Handles network delays gracefully
- ✅ Retries sync on app launch if failed
- ✅ No duplicate purchase charges
- ✅ Eventually grants access even with delays

---

### Test 10: Subscription Expiry & Renewal

**Objective**: Verify app handles subscription lifecycle correctly

**Note**: This test requires waiting for subscription period or using RevenueCat's test mode

**Steps**:
1. Purchase monthly subscription
2. Wait for subscription to expire (or use RevenueCat test mode to simulate)
3. **VERIFY**: RevenueCat webhook fires (check dashboard)
4. Reopen app after expiry
5. **VERIFY**: Subscription status updates to inactive
6. Try to access premium meditation
7. **VERIFY**: Lock screen appears again
8. Check Profile
9. **VERIFY**: Shows "Free Account" or expired status
10. Check Supabase `user_subscriptions`
11. **VERIFY**: `is_active: false`

**Auto-Renewal Test**:
1. Ensure subscription is set to auto-renew
2. Wait for renewal date
3. **VERIFY**: RevenueCat processes renewal
4. Reopen app after renewal
5. **VERIFY**: Premium access continues
6. **VERIFY**: `is_active: true` in Supabase

**Expected Results**:
- ✅ Expired subscriptions lose access
- ✅ Active subscriptions maintain access
- ✅ Auto-renewal works correctly
- ✅ Supabase stays in sync with RevenueCat

---

### Test 11: Platform Detection Logic

**Objective**: Verify app routes to correct payment method based on platform

**Web Platform Test**:
1. Open app in web browser (not native)
2. Navigate to locked premium content
3. Pass parental gate
4. **VERIFY**: Does NOT show RevenueCat paywall
5. **VERIFY**: Redirects to explore page or web payment (if implemented)
6. **VERIFY**: No RevenueCat errors in console

**Native Platform Test**:
1. Open app on iOS/Android device
2. Navigate to locked premium content
3. Pass parental gate
4. **VERIFY**: Shows RevenueCat native paywall
5. **VERIFY**: Products loaded from App Store/Play Store
6. **VERIFY**: Native payment sheet works

**Expected Results**:
- ✅ Web: Skips RevenueCat, uses web flow
- ✅ Native: Uses RevenueCat IAP
- ✅ No crashes or errors on either platform
- ✅ Clear platform detection in logs

---

### Test 12: Error Handling & Edge Cases

**Offerings Load Failure**:
1. Disable network
2. Pass parental gate
3. **VERIFY**: Shows "Unable to Load Products" message
4. **VERIFY**: Shows "Retry" button
5. Enable network
6. Tap "Retry"
7. **VERIFY**: Offerings load successfully

**Purchase Cancellation**:
1. Start purchase flow
2. When native payment sheet appears, tap "Cancel"
3. **VERIFY**: Returns to paywall without error
4. **VERIFY**: No error toast
5. **VERIFY**: Can retry purchase

**Account Sign Out After Purchase**:
1. Complete purchase
2. Go to Profile
3. Sign out
4. Sign back in with SAME account
5. **VERIFY**: Subscription still active
6. **VERIFY**: Premium access maintained

**Account Deletion with Active Subscription**:
1. Complete purchase
2. Go to Profile → Delete Account
3. **VERIFY**: Warning about subscription loss
4. Confirm deletion
5. Recreate account with SAME email
6. Restore purchases
7. **VERIFY**: Subscription recognized (tied to App Store/Play account)

**Expected Results**:
- ✅ All error scenarios handled gracefully
- ✅ Clear user feedback for all failures
- ✅ No app crashes or undefined states
- ✅ Retry mechanisms work

---

### Test 13: Analytics & Tracking Verification

**Objective**: Verify purchase events are tracked correctly

**Steps**:
1. Complete Peace Plan purchase
2. Check PostHog/analytics dashboard
3. **VERIFY**: `paywall_viewed` event logged
4. **VERIFY**: `purchase_initiated` event logged with product ID
5. **VERIFY**: `purchase_completed` event logged with product ID
6. Complete Peace Plus purchase
7. **VERIFY**: Events logged with correct product ID
8. Restore purchases
9. **VERIFY**: Restore event logged (if implemented)

**Expected Results**:
- ✅ All purchase funnel events tracked
- ✅ Product IDs passed correctly
- ✅ User properties updated with subscription tier
- ✅ Analytics dashboard shows purchase flow

---

### Test 14: Supabase Sync Verification

**Objective**: Verify backend database stays in sync with RevenueCat

**Steps**:
1. Complete purchase
2. Check RevenueCat dashboard
3. **VERIFY**: Customer has active entitlement
4. Check Supabase `user_subscriptions` table
5. **VERIFY**: Row exists for user
6. **VERIFY**: `plan_type` matches purchase (peace_plan or peace_plus_plan)
7. **VERIFY**: `is_active: true`
8. **VERIFY**: `updated_at` timestamp is recent
9. Restore purchases on different device
10. Check Supabase again
11. **VERIFY**: Same subscription record
12. **VERIFY**: `updated_at` timestamp updated

**Webhook Setup** (for production):
1. Configure RevenueCat webhook to point to Supabase function
2. Test subscription event triggers
3. **VERIFY**: Supabase updates automatically on:
   - New purchase
   - Renewal
   - Cancellation
   - Expiration

**Expected Results**:
- ✅ Supabase mirrors RevenueCat state
- ✅ Timestamps updated on sync
- ✅ Plan types mapped correctly
- ✅ Webhook integration works (production)

---

### Test 15: Sandbox Testing Procedures

**iOS Sandbox Testing**:
1. Create sandbox tester account in App Store Connect
2. Sign out of production App Store on device
3. Install test build via TestFlight
4. Attempt purchase
5. **VERIFY**: Prompted to sign in with sandbox account
6. Sign in with sandbox credentials
7. Complete purchase
8. **VERIFY**: Purchase completes in sandbox
9. **VERIFY**: Receipt validated by RevenueCat
10. **VERIFY**: Premium access granted
11. Go to iOS Settings → App Store → Sandbox Account
12. **VERIFY**: Can manage subscription
13. **VERIFY**: Can cancel subscription

**Android Test Account Testing**:
1. Add tester email to Google Play Console
2. Opt-in to internal testing
3. Install test build
4. Attempt purchase
5. **VERIFY**: Shows test purchase dialog
6. Complete test purchase
7. **VERIFY**: Purchase completes (no actual charge)
8. **VERIFY**: Receipt validated by RevenueCat
9. **VERIFY**: Premium access granted
10. Go to Google Play → Subscriptions
11. **VERIFY**: Can view test subscription
12. **VERIFY**: Can cancel test subscription

**Expected Results**:
- ✅ iOS: Sandbox purchases work end-to-end
- ✅ Android: Test purchases work without charging
- ✅ RevenueCat validates test receipts
- ✅ Can test full flow without real money

---

## Critical Blockers Checklist

Before shipping to production, verify:

- [ ] Real RevenueCat API keys configured (not PLACEHOLDER)
- [ ] Products exist in App Store Connect with correct IDs
- [ ] Products exist in Google Play Console with correct IDs
- [ ] RevenueCat dashboard offerings configured correctly
- [ ] Entitlement IDs match exactly in code and dashboard
- [ ] Parental gate cannot be bypassed on any flow
- [ ] Restore purchases works for existing subscribers
- [ ] Subscription management links work on both platforms
- [ ] Supabase sync works reliably
- [ ] Analytics events firing correctly
- [ ] Error messages user-friendly (no technical jargon)
- [ ] No console errors on web platform
- [ ] Tested on real iOS device (not simulator)
- [ ] Tested on real Android device (not emulator)
- [ ] Webhook configured for production (if using)

---

## Post-Launch Monitoring

After production release, monitor:

1. **RevenueCat Dashboard**:
   - Daily active subscribers count
   - Conversion rate (paywall views → purchases)
   - Churn rate
   - Failed transactions

2. **Supabase**:
   - `user_subscriptions` table integrity
   - Sync failures (mismatched states)

3. **Analytics**:
   - Purchase funnel drop-off points
   - Parental gate pass rate
   - Restore purchase success rate

4. **Customer Support**:
   - Common purchase issues
   - Restore purchase failures
   - Billing questions

5. **App Store/Play Store Reviews**:
   - Purchase-related complaints
   - Subscription confusion
   - Cancellation difficulties

---

## Troubleshooting Guide

**"Unable to Load Products"**:
- Check RevenueCat API keys are correct
- Verify offerings configured in dashboard
- Ensure products exist in App Store/Play Console
- Check device network connection

**"Purchase Cancelled by User"**:
- User tapped cancel button (expected behavior)
- Payment method issue (check App Store/Play settings)

**"Sync Warning: Purchase successful but sync failed"**:
- RevenueCat purchase succeeded
- Supabase update failed (network/permissions issue)
- User should restart app to retry sync

**"No Purchases Found" when restoring**:
- User hasn't purchased before (expected)
- Different App Store/Play account than purchase
- Need to sign in with correct platform account

**Premium access not working after purchase**:
1. Check RevenueCat dashboard for active entitlement
2. Check Supabase `user_subscriptions` table
3. Force app restart
4. Try "Restore Purchases"
5. Check device logs for errors

---

## Testing Sign-Off

Before marking this feature complete, ensure:

- [ ] All 15 tests passed on iOS
- [ ] All 15 tests passed on Android
- [ ] Critical blockers checklist complete
- [ ] Product owner approved flows
- [ ] Legal approved parental gate implementation
- [ ] No known P0/P1 bugs

**Tested By**: ________________
**Date**: ________________
**Build Version**: ________________
**Platform**: iOS ☐ Android ☐
**Sign-Off**: ________________
