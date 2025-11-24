# Google Play Console: Free Trial Configuration Guide

This guide walks you through configuring free trials for the Peaceful Kids subscriptions in Google Play Console.

## Prerequisites

- Google Play Console account with admin access
- Peaceful Kids app already published or in testing
- In-app subscription products already created:
  - `peaceful_meditations_monthly` (Peace Plan)
  - `peaceful_all_monthly` (Peace Plus)

## Step 1: Navigate to Subscriptions

1. Log in to [Google Play Console](https://play.google.com/console)
2. Select **Peaceful Kids** app from your app list
3. In the left sidebar, click **Monetize** > **Products** > **Subscriptions**
4. You should see your existing subscription products

## Step 2: Configure Peace Plan (7-Day Free Trial)

### Open Product Configuration

1. Find and click on `peaceful_meditations_monthly`
2. Click on the **Base plans and offers** tab

### Add Free Trial to Base Plan

**Option A: Edit Existing Base Plan**

1. Click on your existing monthly base plan (likely named "Monthly" or similar)
2. Click **Edit base plan**
3. Scroll to **Free trial** section
4. Toggle **Offer a free trial** to ON
5. Set **Trial period**: `7 days`
6. Click **Save**

**Option B: Create New Base Plan with Trial**

If you need to create a new plan:

1. Click **Add base plan**
2. **Plan ID**: `monthly-with-trial` (or keep existing)
3. **Billing period**: 1 Month
4. **Base plan price**: $5.99 USD (set for all regions)
5. Under **Free trial**:
   - Toggle ON
   - **Trial period**: 7 days
6. **Auto-renewal**: Enabled
7. Click **Save**

### Verify Configuration

Confirm the base plan shows:
- ✅ **Free trial**: 7 days
- ✅ **Base price**: $5.99/month
- ✅ **Auto-renewing**: Yes
- ✅ **Status**: Active

## Step 3: Configure Peace Plus (14-Day Free Trial)

### Open Product Configuration

1. Go back to subscription products list
2. Click on `peaceful_all_monthly`
3. Click **Base plans and offers** tab

### Add Free Trial

1. Click on the monthly base plan
2. Click **Edit base plan**
3. Enable **Offer a free trial**
4. Set **Trial period**: `14 days`
5. Click **Save**

### Verify Configuration

Confirm:
- ✅ **Free trial**: 14 days
- ✅ **Base price**: $9.99/month
- ✅ **Auto-renewing**: Yes
- ✅ **Status**: Active

## Step 4: Configure BRAVOANDCOCKTAILS Promo Code

### Understanding Google Play Promo Codes

Google Play has two types of promo codes:
1. **Subscription Offers** (developer-controlled, used in-app)
2. **Promotional Codes** (one-time use codes for distribution)

For BRAVOANDCOCKTAILS extended trial, we'll use **Subscription Offers**.

### Create Subscription Offer (Peace Plan)

1. Navigate to `peaceful_meditations_monthly` product
2. Click **Base plans and offers** tab
3. Click **Create offer**
4. Configure the offer:
   - **Offer ID**: `bravoandcocktails-peace-extended-trial`
   - **Offer name**: "BRAVOANDCOCKTAILS Extended Trial - Peace"
   - **Eligibility**: New customers only (or select your preference)

5. **Phases** configuration:
   - **Phase 1 (Extended Trial)**:
     - Price: Free ($0.00)
     - Duration: 14 days (extended from standard 7 days)
   - **Phase 2 (Regular Billing)**:
     - Price: $5.99
     - Duration: 1 month (recurring)

6. **Offer tags** (important for app integration):
   - Add tag: `BRAVOANDCOCKTAILS`
   - This is how RevenueCat will identify the offer

7. Click **Save**

### Create Subscription Offer (Peace Plus)

1. Navigate to `peaceful_all_monthly` product
2. Click **Base plans and offers** tab
3. Click **Create offer**
4. Configure:
   - **Offer ID**: `bravoandcocktails-peaceplus-extended-trial`
   - **Offer name**: "BRAVOANDCOCKTAILS Extended Trial - Peace Plus"
   - **Eligibility**: New customers only

5. **Phases**:
   - **Phase 1**:
     - Price: Free
     - Duration: 21 days (extended from standard 14 days)
   - **Phase 2**:
     - Price: $9.99
     - Duration: 1 month (recurring)

6. **Offer tags**:
   - Add tag: `BRAVOANDCOCKTAILS`

7. Click **Save**

### Activate Offers

1. Ensure both offers are set to **Active**
2. Offers become available immediately (no review needed)

## Step 5: Alternative - One-Time Promo Codes

If you prefer to generate one-time use codes for distribution:

### Create Promotional Codes

1. Go to **Monetize** > **Promotional codes**
2. Click **Create promotional code**
3. Configure:
   - **Promotion name**: BRAVOANDCOCKTAILS Extended Trial
   - **Product**: Select subscription product
   - **Offer**: Select the offer created above
   - **Quantity**: Number of codes to generate (e.g., 1000)
   - **Expiration date**: Set or leave blank
4. Click **Create codes**
5. Download the CSV file with generated codes
6. Distribute codes to users

## Step 6: Test with Internal Testing

### Add Test Account

1. Go to **Release** > **Testing** > **Internal testing**
2. Add your test email to testers list
3. Share test link with yourself

### Testing Checklist

- [ ] Install app from internal testing track
- [ ] Sign in with test Google account
- [ ] Navigate to subscription screen
- [ ] Verify "Start 7-Day Free Trial" shows for Peace Plan
- [ ] Verify "Start 14-Day Free Trial" shows for Peace Plus
- [ ] Complete purchase with test account
- [ ] Verify trial activates
- [ ] Test BRAVOANDCOCKTAILS offer redemption
- [ ] Verify extended trial applies

### Testing Notes

- Google Play sandbox is more realistic than Apple's accelerated sandbox
- Trials run in real-time (7 actual days)
- Use test cards or Google Play test accounts
- You can cancel and resubscribe for testing purposes

## Step 7: Verify RevenueCat Integration

### Check RevenueCat Dashboard

1. Log in to [RevenueCat](https://app.revenuecat.com)
2. Go to your Peaceful Kids Android app
3. Navigate to **Products**
4. Verify products show:
   - Base plan with free trial
   - Correct trial durations

### Product Synchronization

Google Play products sync to RevenueCat automatically:
1. RevenueCat polls Google Play every few hours
2. New offers and trials appear in RevenueCat within 24 hours
3. Force refresh by going to **Settings** > **Google Play**

### Verify Offers

1. Check that BRAVOANDCOCKTAILS offers appear in RevenueCat
2. Verify offer tags are synced
3. Test offer redemption through RevenueCat SDK

## Step 8: Legal and Compliance

### Required Disclosures

Your app MUST display:
- Trial duration clearly ("Start 7-Day Free Trial")
- Price after trial ("After trial: $5.99/month")
- Auto-renewal statement ("Renews automatically unless cancelled")
- Cancellation policy and link to manage subscriptions

### Google Play Policies

Ensure compliance with:
- **Subscription disclosure requirements** (price, trial terms, cancellation)
- **Accurate product descriptions** in Play Console
- **No misleading trial offers** (e.g., can't make cancellation difficult)

### Subscription Terms URL

1. In Play Console, go to your subscription product
2. Add **Terms of Service URL** if not already present
3. This URL is displayed to users during purchase

## Step 9: Country/Regional Configuration

### Set Up Pricing for All Regions

1. For each subscription product
2. Click **Base plans and offers**
3. Click on your base plan
4. Click **Edit prices**
5. Choose pricing strategy:
   - **Auto-convert from USD** (recommended)
   - **Manual pricing per country**
6. Verify trial availability in all regions
7. Save changes

### Regional Restrictions

If you want to limit trials to specific countries:
1. Edit base plan
2. Under **Countries/regions**, select specific countries
3. Save

## Troubleshooting

### Trial Not Showing in App

**Problem**: App doesn't display trial information

**Solutions**:
- Verify trial is active in base plan
- Check RevenueCat has synced (allow 24 hours)
- Ensure app queries correct base plan ID
- Check product is available in test device's region

### "Offer Not Available"

**Problem**: Users can't access trial

**Solutions**:
- User may have already used trial for this product
- Check subscription eligibility settings
- Verify product is active and published
- Ensure device region matches available regions

### BRAVOANDCOCKTAILS Not Working

**Problem**: Promo offer doesn't apply

**Solutions**:
- Verify offer is Active in Play Console
- Check offer tag is exactly `BRAVOANDCOCKTAILS`
- Ensure user meets eligibility criteria (new customer, etc.)
- Verify offer hasn't reached redemption limit
- Check app is using correct offer tag in code

### Testing with Multiple Accounts

**Problem**: Can only test trial once per account

**Solutions**:
- Create multiple Google test accounts
- Use Google Play's test account feature
- Clear Play Store app data between tests
- Use different email addresses for testing

### Offer Not Syncing to RevenueCat

**Problem**: BRAVOANDCOCKTAILS offer doesn't appear in RevenueCat

**Solutions**:
- Wait 24 hours for automatic sync
- Manually refresh in RevenueCat settings
- Verify offer tags are correctly set
- Check RevenueCat service account permissions

## Step 10: Production Deployment

### Pre-Launch Checklist

Before going live:
- [ ] Trials configured and tested for both products
- [ ] BRAVOANDCOCKTAILS offers active
- [ ] RevenueCat synced and verified
- [ ] Legal terms updated
- [ ] Subscription management links tested
- [ ] App UI displays trial info correctly
- [ ] End-to-end purchase flow tested

### Launch Steps

1. Ensure app is in **Production** or **Open Testing** track
2. Verify all subscription products are **Active**
3. Monitor RevenueCat dashboard for trial conversions
4. Watch for user feedback about trials

### Post-Launch Monitoring

Monitor these metrics:
- Trial start rate
- Trial-to-paid conversion rate
- BRAVOANDCOCKTAILS redemption count
- Subscription churn rate
- Revenue impact

## Additional Resources

- [Google Play: Subscriptions](https://support.google.com/googleplay/android-developer/answer/140504)
- [Google Play: Free trials and introductory pricing](https://support.google.com/googleplay/android-developer/answer/140504#free-trials)
- [Google Play: Promotional codes](https://support.google.com/googleplay/android-developer/answer/6321495)
- [RevenueCat: Android Subscription Offers](https://www.revenuecat.com/docs/google-subscriptions-and-backwards-compatibility)

## Next Steps

After completing this configuration:
1. ✅ Trials are configured in both App Store Connect and Google Play
2. ✅ Update app code to display trial information
3. ✅ Test trial and promo code flows
4. ✅ Submit app update for review
5. ✅ Monitor trial conversion metrics

---

**Last Updated**: November 24, 2025
**App**: Peaceful Kids
**Products**: Peace Plan ($5.99/mo), Peace Plus ($9.99/mo)
**Trials**: 7 days (Peace), 14 days (Peace Plus)
**Promo Code**: BRAVOANDCOCKTAILS (extended trial offer)
**Platform**: Android via Google Play
