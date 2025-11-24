# Free Trial & Promo Code Testing Guide

This guide provides comprehensive testing procedures for the free trial and BRAVOANDCOCKTAILS promo code implementation.

## Prerequisites

### iOS Testing

- Xcode installed with iOS Simulator
- TestFlight access or development build
- Multiple iOS sandbox test accounts (create at least 3)
  - Go to [App Store Connect](https://appstoreconnect.apple.com) > Users and Access > Sandbox Testers
  - Each account can only use a trial once per product

### Android Testing

- Android Studio installed with emulator
- Google Play internal testing track access
- Multiple Google test accounts

### RevenueCat Setup

- Trials configured in App Store Connect (7 days for Peace, 14 days for Peace Plus)
- Trials configured in Google Play Console
- BRAVOANDCOCKTAILS promo code configured in both stores
- RevenueCat dashboard access to verify sync

---

## Test Plan Overview

### Phase 1: Trial Display Testing
1. New user sees trial offers
2. Trial information displays correctly
3. Trial eligibility works on iOS
4. Ineligible users see standard subscribe button

### Phase 2: Trial Purchase Testing
5. Trial purchase flow completes successfully
6. Trial activates correctly
7. Subscription syncs to Supabase
8. Trial period tracking works

### Phase 3: Promo Code Testing
9. Promo code redemption UI works (iOS)
10. BRAVOANDCOCKTAILS code applies extended trial
11. Promo codes sync correctly

### Phase 4: Edge Cases
12. Already subscribed users
13. Trial expiration and conversion
14. Error handling

---

## Phase 1: Trial Display Testing

### Test 1.1: New User Sees Trial Offers

**Objective**: Verify that new users see the free trial offers in the paywall.

**Steps**:
1. Sign out of any existing account
2. Create a new account or sign in with a fresh sandbox account
3. Navigate to a premium content item
4. Click "Upgrade to Premium"
5. Pass the parental gate
6. Observe the paywall

**Expected Results**:
- ✅ Peace Plan card shows:
  - "7 Days Free" badge next to title
  - "Then $5.99/month" as pricing text
  - Button says "Start 7 Days Free Trial"
  - Disclaimer: "Free for 7 days, then $5.99/month. Cancel anytime."
- ✅ Peace Plus Plan card shows:
  - "14 Days Free" badge next to title
  - "Then $9.99/month" as pricing text
  - Button says "Start 14 Days Free Trial"
  - Disclaimer: "Free for 14 days, then $9.99/month. Cancel anytime."

**Pass Criteria**: Both cards display trial information correctly

---

### Test 1.2: Static Subscription Card Shows Trials

**Objective**: Verify static subscription cards (e.g., on Explore page) show trial offers.

**Steps**:
1. Navigate to the Explore page or any page showing SubscriptionCard component
2. Observe the pricing display

**Expected Results**:
- ✅ Peace Plan shows:
  - "7 Days Free" in large green text
  - "Then $5.99/month" below
  - Button: "Start 7-Day Free Trial"
- ✅ Peace Plus shows:
  - "14 Days Free" in gradient text
  - "Then $9.99/month" below
  - Button: "Start 14-Day Free Trial"
- ✅ Disclaimer: "Start with a free trial. Billed monthly after trial ends. Cancel anytime."

**Pass Criteria**: Static cards display trial information correctly

---

### Test 1.3: iOS Trial Eligibility Check (iOS Only)

**Objective**: Verify trial eligibility checking works on iOS.

**Steps**:
1. On iOS device/simulator with fresh sandbox account
2. Navigate to paywall
3. Observe the initial load

**Expected Results**:
- ✅ Loading spinner appears briefly while checking eligibility
- ✅ Trial offers appear after eligibility check completes
- ✅ Console logs show: `[RevenueCat] Trial eligibility check result: ...`

**Pass Criteria**: Eligibility check completes without errors

---

### Test 1.4: Ineligible User UI (iOS Only)

**Objective**: Verify that users who already used their trial see standard subscribe button.

**Steps**:
1. Use an iOS sandbox account that has already redeemed a trial
2. Navigate to paywall
3. Observe the button text

**Expected Results**:
- ✅ Button says "Subscribe for $5.99/month" (not "Start Free Trial")
- ✅ No trial badge shown
- ✅ Pricing shows "$5.99/month" (not "Then $5.99/month")

**Pass Criteria**: Ineligible users see non-trial UI

**Note**: On Android and web, eligibility checking is not performed, so all users see trial UI. The store will handle eligibility at purchase time.

---

## Phase 2: Trial Purchase Testing

### Test 2.1: Peace Plan Trial Purchase (iOS)

**Objective**: Complete a trial purchase for Peace Plan on iOS.

**Steps**:
1. Fresh iOS sandbox account (never used trial before)
2. Navigate to paywall
3. Click "Start 7 Days Free Trial" on Peace Plan
4. Complete iOS purchase flow using sandbox account credentials
5. Wait for purchase to complete

**Expected Results**:
- ✅ iOS prompts for sandbox account password
- ✅ Purchase confirmation appears
- ✅ Toast notification: "Purchase Successful! Your subscription is now active. Syncing..."
- ✅ Second toast: "Welcome to Premium! You now have access to all meditations!"
- ✅ Paywall closes automatically
- ✅ Premium content is now accessible

**Pass Criteria**: Purchase completes and premium access is granted

---

### Test 2.2: Peace Plus Trial Purchase (Android)

**Objective**: Complete a trial purchase for Peace Plus on Android.

**Steps**:
1. Fresh Android test account
2. Navigate to paywall
3. Click "Start 14 Days Free Trial" on Peace Plus
4. Complete Google Play purchase flow
5. Wait for purchase to complete

**Expected Results**:
- ✅ Google Play payment sheet appears
- ✅ Shows "Free trial for 14 days, then $9.99/month"
- ✅ Purchase confirmation
- ✅ Toast: "Purchase Successful!"
- ✅ Toast: "Welcome to Premium! You now have access to all content including courses!"
- ✅ Paywall closes
- ✅ All premium content accessible

**Pass Criteria**: Purchase completes and premium access is granted

---

### Test 2.3: Subscription Sync to Supabase

**Objective**: Verify trial subscription syncs correctly to Supabase.

**Steps**:
1. Complete a trial purchase (Test 2.1 or 2.2)
2. Open Supabase dashboard
3. Go to Table Editor > `user_subscriptions`
4. Find the subscription record for the test user

**Expected Results**:
- ✅ Record exists with:
  - `user_id`: Test user's ID
  - `plan_type`: `peace_plan` or `peace_plus_plan`
  - `is_active`: `true`
  - `source`: `ios` or `android`
  - `revenuecat_customer_id`: Customer ID from RevenueCat
- ✅ `created_at` and `updated_at` timestamps are recent

**Pass Criteria**: Subscription record exists and is correct

---

### Test 2.4: Profile Shows Active Subscription

**Objective**: Verify user profile reflects active trial subscription.

**Steps**:
1. After completing trial purchase
2. Navigate to Profile page
3. Check subscription section

**Expected Results**:
- ✅ Shows "Peace Plan" or "Peace Plus Plan" badge
- ✅ "Active" status displayed
- ✅ "Manage Subscription" button visible
- ✅ "Subscribe" button hidden (user already has subscription)
- ✅ "Refresh Subscription" button works

**Pass Criteria**: Profile correctly shows active subscription

---

### Test 2.5: Trial Period Tracking (iOS)

**Objective**: Verify trial period is tracked correctly.

**Steps**:
1. Complete trial purchase
2. Open RevenueCat dashboard
3. Find the customer in RevenueCat
4. Check subscription details

**Expected Results**:
- ✅ Customer shows active subscription
- ✅ Trial end date is 7 or 14 days from start
- ✅ First billing date is after trial end date
- ✅ RevenueCat shows "In Trial" status

**Pass Criteria**: Trial period is correctly tracked in RevenueCat

**Note**: In iOS sandbox, trials are accelerated (e.g., 7-day trial = 5 minutes). Check Apple's sandbox trial duration mapping.

---

## Phase 3: Promo Code Testing

### Test 3.1: Promo Code Button Visibility (iOS Only)

**Objective**: Verify promo code redemption button appears on iOS.

**Steps**:
1. Open app on iOS device/simulator
2. Navigate to Profile page
3. Scroll to Subscription section

**Expected Results**:
- ✅ "Redeem Promo Code" button visible (with Gift icon)
- ✅ Button is after "Restore Purchases" and before "Manage Subscription"
- ✅ Button shows ChevronRight icon

**Pass Criteria**: Button is visible on iOS

**Note**: Button should NOT appear on Android or web.

---

### Test 3.2: Promo Code Redemption UI (iOS)

**Objective**: Verify native iOS redemption sheet opens.

**Steps**:
1. On iOS device/simulator
2. Navigate to Profile > Subscription section
3. Click "Redeem Promo Code" button

**Expected Results**:
- ✅ Native iOS code redemption sheet appears
- ✅ Sheet has text input for promo code
- ✅ Apple branding visible
- ✅ "Redeem" button present

**Pass Criteria**: Native sheet opens without errors

---

### Test 3.3: BRAVOANDCOCKTAILS Code Redemption

**Objective**: Redeem BRAVOANDCOCKTAILS promo code and verify extended trial.

**Steps**:
1. Fresh iOS sandbox account (not subscribed)
2. Navigate to Profile > Subscription
3. Click "Redeem Promo Code"
4. Enter: `BRAVOANDCOCKTAILS` (all caps)
5. Click Redeem
6. Wait for confirmation

**Expected Results**:
- ✅ Code is accepted by Apple
- ✅ Confirmation message from iOS
- ✅ After 2 seconds, toast: "Promo Code Applied! Your Peace Plan is now active."
- ✅ Subscription syncs to Supabase
- ✅ User now has premium access
- ✅ Trial period is extended (e.g., 14 days instead of 7 for Peace Plan)

**Pass Criteria**: Code redeems successfully and grants extended trial

---

### Test 3.4: Invalid Promo Code Handling

**Objective**: Verify error handling for invalid codes.

**Steps**:
1. Open redemption sheet
2. Enter invalid code: `INVALIDCODE123`
3. Click Redeem

**Expected Results**:
- ✅ iOS shows error: "This code is not valid"
- ✅ Sheet remains open
- ✅ User can try again

**Pass Criteria**: Invalid codes show appropriate error

---

### Test 3.5: Already Redeemed Code

**Objective**: Verify behavior when code already used.

**Steps**:
1. Account that already redeemed BRAVOANDCOCKTAILS
2. Try to redeem same code again

**Expected Results**:
- ✅ iOS shows error: "You've already redeemed this offer"
- ✅ No duplicate subscription created

**Pass Criteria**: Already redeemed codes are rejected

---

### Test 3.6: Promo Code Sync to RevenueCat

**Objective**: Verify promo redemption syncs to RevenueCat.

**Steps**:
1. Redeem BRAVOANDCOCKTAILS code
2. Open RevenueCat dashboard
3. Find customer record
4. Check transaction history

**Expected Results**:
- ✅ Transaction shows promo code redemption
- ✅ Extended trial period visible
- ✅ Correct entitlement granted

**Pass Criteria**: Promo redemption appears in RevenueCat

---

## Phase 4: Edge Cases

### Test 4.1: Already Subscribed User

**Objective**: Verify behavior for users with active subscription.

**Steps**:
1. User with active trial or paid subscription
2. Navigate to premium content

**Expected Results**:
- ✅ No paywall appears
- ✅ Premium content is accessible
- ✅ Profile shows active subscription

**Pass Criteria**: Subscribed users bypass paywall

---

### Test 4.2: Trial Cancellation During Trial

**Objective**: Verify users can cancel trial before billing.

**Steps**:
1. User with active trial
2. Navigate to Profile > Manage Subscription
3. Opens App Store/Play Store subscription management
4. Cancel subscription
5. Refresh app

**Expected Results**:
- ✅ Subscription shows "Active until [trial end date]"
- ✅ User retains access until trial ends
- ✅ No billing occurs after trial ends

**Pass Criteria**: Cancellation works correctly

---

### Test 4.3: Trial Expiration and Conversion

**Objective**: Verify trial converts to paid subscription.

**Steps**:
1. Wait for trial period to end (use sandbox accelerated time)
2. Verify user is billed
3. Check subscription status

**Expected Results**:
- ✅ After trial ends, first payment is processed
- ✅ Subscription remains active
- ✅ User still has premium access
- ✅ Supabase record shows continued active status

**Pass Criteria**: Trial converts to paid subscription

**Note**: In sandbox, this happens very quickly (minutes). In production, takes full 7/14 days.

---

### Test 4.4: Network Error Handling

**Objective**: Verify graceful error handling.

**Steps**:
1. Enable Airplane Mode
2. Try to load paywall
3. Disable Airplane Mode
4. Try again

**Expected Results**:
- ✅ Error toast: "Failed to load subscription options"
- ✅ Retry button available
- ✅ After reconnecting, paywall loads correctly

**Pass Criteria**: Network errors are handled gracefully

---

### Test 4.5: Restore Purchases with Trial

**Objective**: Verify restore purchases works for trial subscriptions.

**Steps**:
1. Account with active trial on Device A
2. Sign in to same account on Device B
3. Navigate to Profile > Restore Purchases

**Expected Results**:
- ✅ Toast: "Restoring Purchases..."
- ✅ Toast: "Purchases Restored! Your Peace Plan subscription has been restored."
- ✅ Premium access granted on Device B

**Pass Criteria**: Trial subscription restores correctly

---

## Comprehensive Testing Checklist

### iOS Testing Checklist

- [ ] **Trial Display**
  - [ ] New user sees trial offers in paywall
  - [ ] Static cards show trial offers
  - [ ] Trial eligibility check completes
  - [ ] Ineligible users see standard UI

- [ ] **Trial Purchase**
  - [ ] Peace Plan trial purchase completes
  - [ ] Peace Plus trial purchase completes
  - [ ] Subscription syncs to Supabase
  - [ ] Profile shows active subscription
  - [ ] RevenueCat tracks trial period

- [ ] **Promo Code**
  - [ ] Redeem button visible on Profile
  - [ ] Native redemption sheet opens
  - [ ] BRAVOANDCOCKTAILS code works
  - [ ] Invalid code shows error
  - [ ] Already redeemed code rejected
  - [ ] Promo syncs to RevenueCat

- [ ] **Edge Cases**
  - [ ] Subscribed user bypasses paywall
  - [ ] Trial cancellation works
  - [ ] Trial converts to paid
  - [ ] Network errors handled
  - [ ] Restore purchases works

### Android Testing Checklist

- [ ] **Trial Display**
  - [ ] New user sees trial offers in paywall
  - [ ] Static cards show trial offers

- [ ] **Trial Purchase**
  - [ ] Peace Plan trial purchase completes
  - [ ] Peace Plus trial purchase completes
  - [ ] Subscription syncs to Supabase
  - [ ] Profile shows active subscription

- [ ] **Edge Cases**
  - [ ] Subscribed user bypasses paywall
  - [ ] Trial cancellation works
  - [ ] Trial converts to paid
  - [ ] Network errors handled
  - [ ] Restore purchases works

**Note**: Promo code redemption is iOS-only, so Android testing excludes promo tests.

---

## Known Issues / Limitations

### iOS Sandbox Behavior

1. **Accelerated Time**: Trials complete much faster (7-day trial = 5 minutes)
2. **One Trial Per Account**: Each sandbox account can only test a trial once
3. **Auto-Renewal Speed**: Subscriptions renew every few minutes in sandbox
4. **Purchase Popups**: May need to confirm multiple times

### Android Testing

1. **Real-Time Trials**: Google Play sandbox runs trials in real-time (7 actual days)
2. **Test Accounts Required**: Need Google test accounts, not regular accounts
3. **Promo Codes**: May need to generate test promo codes in Play Console

### General Limitations

1. **Trial Eligibility**: Android doesn't support pre-purchase eligibility checking
2. **Promo Code UI**: Native iOS sheet only; no custom Android implementation
3. **RevenueCat Sync**: May take a few seconds to sync after purchase

---

## Troubleshooting

### Trials Not Showing

**Problem**: Paywall doesn't show trial information

**Solutions**:
- Verify trials configured in App Store Connect / Play Console
- Check RevenueCat has synced products (Dashboard > Products)
- Rebuild app and clear cache
- Check console for errors in trial parsing

### Promo Code Button Missing

**Problem**: "Redeem Promo Code" button doesn't appear

**Solutions**:
- Verify running on iOS (button is iOS-only)
- Check `isIOS()` returns true
- Verify imports are correct
- Restart app

### Purchase Fails

**Problem**: Trial purchase doesn't complete

**Solutions**:
- Check sandbox account is signed in to App Store
- Verify product IDs match between app and store
- Check RevenueCat API keys are correct
- Review console logs for detailed error

### Subscription Doesn't Sync

**Problem**: Purchase completes but Supabase doesn't update

**Solutions**:
- Check network connectivity
- Verify Supabase webhooks are configured
- Manual refresh: Profile > Refresh Subscription
- Check RevenueCat webhook logs

---

## Success Criteria

The implementation is considered successful when:

1. ✅ All iOS tests pass
2. ✅ All Android tests pass
3. ✅ Promo code redemption works on iOS
4. ✅ No critical bugs found
5. ✅ Trial-to-paid conversion works
6. ✅ Subscription sync is reliable
7. ✅ Error handling is graceful

---

## Next Steps After Testing

1. **Fix Any Bugs**: Address issues found during testing
2. **Submit for Review**:
   - iOS: Submit to App Review via TestFlight
   - Android: Promote to Open Testing or Production
3. **Monitor Metrics**:
   - Trial start rate
   - Trial-to-paid conversion rate
   - Promo code redemption count
4. **User Feedback**: Collect feedback from beta testers
5. **Iterate**: Make improvements based on testing results

---

**Testing Date**: ___________
**Tester Name**: ___________
**Platform**: iOS / Android
**Test Account**: ___________
**Build Version**: ___________
**Results**: PASS / FAIL
**Notes**: ___________________________________________

---

**Document Version**: 1.0
**Last Updated**: November 24, 2025
**App**: Peaceful Kids
**Feature**: Free Trials (7/14 days) + BRAVOANDCOCKTAILS Promo Code
