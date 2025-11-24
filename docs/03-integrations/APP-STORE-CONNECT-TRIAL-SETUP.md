# App Store Connect: Free Trial Configuration Guide

This guide walks you through configuring free trials for the Peaceful Kids subscriptions in App Store Connect.

## Prerequisites

- App Store Connect account with admin access
- Peaceful Kids app already created in App Store Connect
- In-app purchase products already created:
  - `peaceful_meditations_monthly` (Peace Plan)
  - `peaceful_all_monthly` (Peace Plus)

## Step 1: Navigate to In-App Purchases

1. Log in to [App Store Connect](https://appstoreconnect.apple.com)
2. Click on **My Apps**
3. Select **Peaceful Kids** app
4. Click **Features** in the left sidebar
5. Click **In-App Purchases** or **Subscriptions**

## Step 2: Configure Peace Plan (7-Day Free Trial)

### Find the Product

1. Locate `peaceful_meditations_monthly` in your subscription list
2. Click on the product to open its details

### Add Introductory Offer

1. Scroll to the **Subscription Prices** section
2. Click **Add Introductory Offer** (or **Edit** if one exists)
3. Configure the offer:
   - **Type**: Free Trial
   - **Duration**: 7 Days
   - **Countries and Regions**: Select all regions where you offer the app
4. Click **Save**

### Verify Configuration

Confirm you see:
- **Offer Type**: Free Trial
- **Duration**: 7 days
- **Price**: Free
- **Status**: Active

## Step 3: Configure Peace Plus (14-Day Free Trial)

### Find the Product

1. Go back to subscription list
2. Locate `peaceful_all_monthly`
3. Click on the product

### Add Introductory Offer

1. Scroll to **Subscription Prices** section
2. Click **Add Introductory Offer**
3. Configure:
   - **Type**: Free Trial
   - **Duration**: 14 Days
   - **Countries and Regions**: Select all regions
4. Click **Save**

### Verify Configuration

Confirm:
- **Offer Type**: Free Trial
- **Duration**: 14 days
- **Price**: Free
- **Status**: Active

## Step 4: Configure BRAVOANDCOCKTAILS Promo Code

### Create Promotional Offer

1. Navigate to your subscription group settings
2. Click **Promotional Offers** or **Offer Codes**
3. Click **Create Promotional Offer** or **+**

### Configure the Offer

1. **Offer Reference Name**: `BRAVOANDCOCKTAILS Extended Trial`
2. **Offer Code**: `BRAVOANDCOCKTAILS`
3. **Offer Type**: Extended Free Trial
4. **Configuration**:
   - For Peace Plan: Extend trial to 14 days (or your desired extended duration)
   - For Peace Plus: Extend trial to 21 days (or your desired extended duration)
5. **Eligible Subscriptions**: Select both products or create separate codes
6. **Start Date**: Today's date
7. **End Date**: Leave blank (or set far future date)
8. **Maximum Redemptions**: Set limit or leave unlimited

### One-Time Use Codes

If you prefer to generate one-time use codes instead:

1. Go to **Subscription** > **Offer Codes**
2. Click **Create Custom Code**
3. Enter **BRAVOANDCOCKTAILS**
4. Select **Extended Trial** as the offer type
5. Set extended trial duration
6. Generate codes
7. Download the codes for distribution

## Step 5: Subscription Group Configuration

### Verify Subscription Group

1. Ensure both products are in the same subscription group
2. This allows users to upgrade/downgrade between Peace and Peace Plus
3. Verify the group name (e.g., "Peaceful Meditations Subscriptions")

### Trial Eligibility Rules

Apple's trial rules:
- Users get **one free trial per subscription group**
- If a user subscribes to Peace Plan with trial, they can't get Peace Plus trial
- Upgrading from Peace to Peace Plus doesn't restart the trial
- Promo codes can extend trials or provide additional trial opportunities

## Step 6: Submit for Review (If Required)

### When Review is Needed

- First time adding introductory offers
- Significant changes to subscription structure
- New subscription products

### Submission Process

1. Click **Submit for Review** button
2. Provide review notes explaining the free trial offers
3. Include screenshots showing trial disclosure in your app
4. Wait for Apple's approval (typically 24-48 hours)

## Step 7: Test in Sandbox

### Create Sandbox Test Account

1. Go to **Users and Access** > **Sandbox Testers**
2. Click **+** to add tester
3. Create test account with unique email
4. Note: Each sandbox account can only use a trial once per product

### Testing Checklist

- [ ] Install app from TestFlight with sandbox account
- [ ] Navigate to subscription screen
- [ ] Verify "Start 7-Day Free Trial" appears for Peace Plan
- [ ] Verify "Start 14-Day Free Trial" appears for Peace Plus
- [ ] Complete purchase flow (use sandbox account credentials)
- [ ] Verify trial activates successfully
- [ ] Test promo code BRAVOANDCOCKTAILS redemption
- [ ] Verify extended trial applies correctly

### Sandbox Behavior Notes

- Trials in sandbox are **accelerated** (e.g., 7-day trial = 5 minutes)
- Auto-renewal happens quickly in sandbox
- Use StoreKit Configuration files for more control

## Step 8: Verify RevenueCat Sync

### Check RevenueCat Dashboard

1. Log in to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Go to your Peaceful Kids project
3. Navigate to **Products**
4. Verify both products show:
   - **Introductory Offer**: Free Trial
   - **Duration**: 7 days (Peace) / 14 days (Peace Plus)

### Force Sync

If products don't show trial info:
1. Go to **Settings** > **App Configuration**
2. Click **Refresh Products** or **Re-import Products**
3. Wait 5-10 minutes for sync

## Step 9: Legal Requirements

### Required Disclosures

Your app MUST display:
- Trial duration clearly ("7 Days Free" or "Start 7-Day Free Trial")
- Price after trial ("Then $5.99/month")
- Auto-renewal notice ("Automatically renews unless cancelled")
- Cancellation instructions (link to subscription management)

### Subscription Terms

Add or update subscription terms:
1. Include trial terms in your Terms of Service
2. Display prominently before purchase
3. Link from paywall to full terms

## Troubleshooting

### Trial Not Showing in App

**Problem**: App doesn't display trial information

**Solutions**:
- Verify trial is active in App Store Connect
- Check RevenueCat has synced the product (Step 8)
- Ensure app code checks `product.introPrice` field
- Rebuild and reinstall app

### "Offer Not Available"

**Problem**: Users see "This offer is not available"

**Solutions**:
- User already used trial in this subscription group
- Product not available in user's region
- Subscription group configuration issue
- User's Apple ID region mismatch

### Promo Code Not Working

**Problem**: BRAVOANDCOCKTAILS code doesn't apply

**Solutions**:
- Verify code is active and not expired
- Check redemption limit hasn't been reached
- Ensure code is entered in ALL CAPS
- Verify code is configured for both products
- Check if user is in eligible region

### Sandbox Testing Issues

**Problem**: Can't test trial in sandbox

**Solutions**:
- Create fresh sandbox account (one trial per account)
- Clear app data and reinstall
- Sign out of App Store completely, sign in with sandbox account
- Check StoreKit configuration in Xcode

## Additional Resources

- [Apple: Offer Free Trials](https://developer.apple.com/app-store/subscriptions/#offer-free-trials)
- [Apple: Promotional Offers](https://developer.apple.com/app-store/subscriptions/promotional-offers/)
- [RevenueCat: iOS Subscription Offers](https://www.revenuecat.com/docs/ios-subscription-offers)
- [App Store Review Guidelines: Section 3.1.2](https://developer.apple.com/app-store/review/guidelines/#in-app-purchase)

## Next Steps

After completing this configuration:
1. ✅ Move on to Google Play Console trial setup
2. ✅ Update app code to display trial information
3. ✅ Test trial flow end-to-end
4. ✅ Submit app for review if needed

---

**Last Updated**: November 24, 2025
**App**: Peaceful Kids
**Products**: Peace Plan ($5.99/mo), Peace Plus ($9.99/mo)
**Trials**: 7 days (Peace), 14 days (Peace Plus)
**Promo Code**: BRAVOANDCOCKTAILS (extended trial)
