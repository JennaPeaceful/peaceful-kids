# PostHog Analytics Setup Guide for Peaceful Kids

## Quick Setup (5 minutes)

### 1. Create a PostHog Account

1. Go to https://posthog.com/signup
2. Sign up for the **free Cloud plan** (1M events/month, unlimited session replays)
3. Create a new project:
   - **Project Name**: Peaceful Kids
   - **Industry**: Consumer App
   - **Product Type**: Mobile App

### 2. Get Your API Key

After creating the project, PostHog will show you:
- **API Key** (starts with `phc_`)
- **Host** (usually `https://us.i.posthog.com`)

Copy these - you'll need them in the next step.

### 3. Add API Key to Environment Variables

Open `.env` file and update the PostHog configuration:

```bash
VITE_POSTHOG_KEY="phc_your_actual_api_key_here"
VITE_POSTHOG_HOST="https://us.i.posthog.com"
```

**That's it!** PostHog is now configured and will start capturing events in production.

---

## Testing PostHog (Optional)

### Test Event Tracking

To verify PostHog is working, you can test it in development mode:

1. Enable PostHog in development:
```bash
# In .env file
VITE_POSTHOG_DEV="true"
```

2. Restart your dev server: `npm run dev`
3. Use the app (play a meditation, complete age gate, etc.)
4. Check your PostHog dashboard at https://app.posthog.com/
5. Events should appear within seconds

---

## What PostHog Tracks

### Automatically Tracked Events:

- ✅ **Page Views** - All page navigation
- ✅ **User Sessions** - Session duration and replay
- ✅ **Platform Info** - Web/iOS/Android, app version

### Manually Tracked Events:

The following custom events are tracked in the app:

1. **meditation_played** - When user starts playing a meditation
   - Properties: `meditation_id`, `meditation_title`, `duration_seconds`

2. **meditation_completed** - When user finishes a meditation
   - Properties: `meditation_id`, `meditation_title`, `duration_seconds`

3. **age_gate_response** - Age gate selection (COPPA compliance)
   - Properties: `is_over_13`

4. **user_signed_up** - New user registration
   - Properties: `signup_method` (email/google/apple)

5. **user_signed_in** - User login
   - Properties: `signin_method` (email/google/apple)

6. **subscription_started** - User purchases subscription
   - Properties: `tier` (monthly/yearly), `price`, `currency`

7. **subscription_cancelled** - User cancels subscription
   - Properties: `tier`, `cancellation_reason`

8. **parental_gate_passed** - Successful parental gate verification
   - Properties: `gate_type` (math_problem)

9. **paywall_viewed** - User sees premium paywall
   - Properties: `source` (e.g., meditation_player, profile)

10. **category_selected** - User selects a category
    - Properties: `category_id`, `category_name`

11. **search_performed** - User performs a search
    - Properties: `search_query`, `results_count`

---

## PostHog Dashboard Features

### Live Events Tab
- See all events happening in real-time
- Filter by event type, user, or property
- Click on events to see full details

### Insights Tab
- Create charts and graphs (e.g., "Meditation completions over time")
- Track trends and user behavior
- Compare metrics across time periods

### Persons Tab
- See individual user profiles
- View their complete event history
- Segment users by behavior

### Session Recordings Tab
- Watch replay of user sessions (with all text/inputs masked for privacy)
- Understand where users get stuck
- Identify UX issues

### Funnels Tab
- Create conversion funnels (e.g., "Sign up → First meditation → Subscription")
- Identify drop-off points
- Optimize user flows

---

## Privacy & COPPA Compliance

PostHog is configured to be **COPPA compliant**:

- ✅ **Person Profiles**: Only created for logged-in users (not anonymous visitors)
- ✅ **Session Replays**: All text and inputs are masked
- ✅ **Age Gate Tracking**: Only tracks whether user is over/under 13, no PII
- ✅ **No Autocapture**: We manually track only important events (not all clicks)

**Never manually send**:
- ❌ Full names of children
- ❌ Email addresses of children
- ❌ Precise age of children (only over/under 13)
- ❌ Location data
- ❌ Personal health information

---

## Costs & Limits

### Free Plan (Cloud)
- ✅ **1M events/month** - More than enough for most apps
- ✅ **Unlimited session replays**
- ✅ **Unlimited team members**
- ✅ **1 year data retention**
- ✅ **All features included** (Insights, Funnels, Cohorts, Experiments)

### What Counts as an Event?
- Each custom event = 1 event (e.g., `meditation_played`)
- Each page view = 1 event
- Same event happening 100 times = 100 events

### If You Exceed Free Tier
- PostHog will email you when approaching limit
- You can upgrade to paid plan ($0.00031/event after 1M)
- Or you can adjust sampling rate to capture fewer events

---

## Production Checklist

Before launching:
- [ ] Add real PostHog API key to `.env`
- [ ] Remove or disable `VITE_POSTHOG_DEV` in production `.env`
- [ ] Test event capture with a test event
- [ ] Set up PostHog alerts for critical events (optional)
- [ ] Configure team access in PostHog dashboard (optional)

---

## Advanced Usage

### Creating Custom Insights

1. Go to **Insights** tab in PostHog
2. Click **New Insight**
3. Select **Trends** or **Funnels**
4. Choose events to track (e.g., `meditation_played`)
5. Add filters (e.g., only show free users)
6. Save insight to dashboard

### Setting Up Alerts

1. Go to **Alerts** tab
2. Click **New Alert**
3. Choose condition (e.g., "meditation_completed drops by 20%")
4. Set notification method (email, Slack, etc.)

### Using Feature Flags (A/B Testing)

PostHog includes feature flags for free:

```typescript
import { posthog } from '@/config/analytics';

// Check if feature is enabled
if (posthog.isFeatureEnabled('new-meditation-player')) {
  // Show new player UI
} else {
  // Show old player UI
}
```

---

## Troubleshooting

### Events Not Appearing in PostHog?
1. Check API key is correct in `.env`
2. Restart dev server after changing `.env`
3. Verify `VITE_POSTHOG_DEV="true"` for dev testing
4. Check browser console for PostHog warnings
5. Make sure event actually occurred (check Network tab)

### Too Many Events?
Adjust sampling rate in `src/config/analytics.ts`:
```typescript
posthog.init(POSTHOG_KEY, {
  capture_pageview: false, // Disable automatic page views
  // Or use sampling:
  loaded: (ph) => {
    if (Math.random() > 0.5) ph.opt_out_capturing(); // Only track 50% of users
  }
});
```

### Want to Filter Out Certain Events?
Add conditional logic in tracking functions:
```typescript
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (!POSTHOG_KEY) return;

  // Don't track test users
  if (properties?.email?.includes('@test.com')) return;

  posthog.capture(eventName, properties);
};
```

---

## Support

- **PostHog Docs**: https://posthog.com/docs
- **Community**: https://posthog.com/community
- **Slack**: https://posthog.com/slack

---

**Questions?** Contact dev@peacefulkids.app
