# Sentry Setup Guide for Peaceful Kids

## Quick Setup (5 minutes)

### 1. Create a Sentry Account
1. Go to https://sentry.io/signup/
2. Sign up for the **free Developer plan** (5,000 errors/month, unlimited projects)
3. Create a new project:
   - **Platform**: React
   - **Project Name**: peaceful-kids
   - **Alert Frequency**: On every new issue (or customize later)

### 2. Get Your DSN
After creating the project, Sentry will show you a DSN that looks like:
```
https://examplePublicKey@o0.ingest.sentry.io/0
```

Copy this DSN - you'll need it in the next step.

### 3. Add DSN to Environment Variables

Open `.env` file and add your DSN:

```bash
VITE_SENTRY_DSN="https://your-actual-dsn@sentry.io/your-project-id"
```

**That's it!** Sentry is now configured and will start capturing errors in production.

---

## Testing Sentry (Optional)

### Test Error Capture
To verify Sentry is working, you can trigger a test error:

1. Add this button temporarily to any page:
```tsx
<button onClick={() => { throw new Error('Sentry test error'); }}>
  Test Sentry
</button>
```

2. Click the button
3. Check your Sentry dashboard at https://sentry.io/
4. You should see the error appear within seconds

### Test in Development
By default, Sentry doesn't send errors in development mode. To enable it:

1. Uncomment this line in `.env`:
```bash
VITE_SENTRY_DEV="true"
```

2. Restart your dev server
3. Trigger a test error
4. Check Sentry dashboard

---

## What Sentry Captures

### Automatically Captured:
- ✅ **React Errors** - Component crashes, render errors
- ✅ **Unhandled Promise Rejections** - Async errors
- ✅ **Console Errors** - Critical errors logged to console
- ✅ **Network Errors** - Failed API calls (via useErrorHandler)
- ✅ **User Context** - When users are logged in (auto-captured)
- ✅ **Device Info** - Platform (iOS/Android/Web), browser, OS
- ✅ **Breadcrumbs** - User actions leading up to error

### Manually Captured (via helpers):
```typescript
import { captureException, captureMessage, addBreadcrumb } from '@/config/sentry';

// Capture an error with context
try {
  // risky code
} catch (error) {
  captureException(error, { extra: { userId: user.id } });
}

// Capture a message
captureMessage('User completed onboarding', 'info');

// Add breadcrumb (context for future errors)
addBreadcrumb({
  message: 'User played meditation',
  category: 'user-action',
  data: { meditationId: '123' },
});
```

---

## Sentry Dashboard Features

### Issues Tab
- See all errors grouped by similarity
- Click an issue to see:
  - Stack trace
  - Device/browser info
  - User actions before error
  - Affected users count

### Performance Tab
- See slow page loads
- Identify performance bottlenecks
- Monitor API response times

### Releases Tab
- Track errors by app version
- See which version has most errors
- Monitor deployment health

---

## Best Practices

### 1. Set User Context After Login
In your auth flow, add:

```typescript
import { setUser } from '@/config/sentry';

// After successful login
setUser({
  id: user.id,
  email: user.email,
  username: user.display_name,
});

// After logout
setUser(null);
```

### 2. Add Breadcrumbs for Important Actions
```typescript
import { addBreadcrumb } from '@/config/sentry';

// When user plays a meditation
addBreadcrumb({
  message: 'Meditation started',
  category: 'meditation',
  data: { id: meditation.id, title: meditation.title },
});

// When user makes a purchase
addBreadcrumb({
  message: 'Purchase initiated',
  category: 'revenue',
  data: { plan: 'peace_plus_plan' },
});
```

### 3. Don't Send Sensitive Data
Sentry is configured to mask:
- ✅ All text in session replays
- ✅ All media in session replays
- ✅ Passwords and credit card numbers (auto-scrubbed)

**Never manually send**:
- ❌ Passwords
- ❌ Payment tokens
- ❌ Personal health information
- ❌ Full credit card numbers

---

## Costs & Limits

### Free Plan (Developer)
- ✅ **5,000 errors/month** - More than enough for most apps
- ✅ **Unlimited projects**
- ✅ **1 user**
- ✅ **30 days error retention**
- ✅ **Performance monitoring included**
- ✅ **Session replay on errors**

### What Counts as an Error?
- Each unique error occurrence = 1 error
- Same error happening 100 times = 100 errors (but Sentry groups them)
- You'll see a count in dashboard

### If You Exceed Free Tier
- Sentry will email you when approaching limit
- You can upgrade to Team plan ($26/month) for 50K errors
- Or you can increase sampling rate to capture fewer errors

---

## Production Checklist

Before launching:
- [ ] Add real Sentry DSN to `.env`
- [ ] Remove or disable `VITE_SENTRY_DEV` in production `.env`
- [ ] Update `VITE_APP_VERSION` to match app version
- [ ] Test error capture with a test error
- [ ] Set up Sentry email alerts
- [ ] Add user context after login (optional but recommended)

---

## Troubleshooting

### Errors Not Appearing in Sentry?
1. Check DSN is correct in `.env`
2. Restart dev server after changing `.env`
3. Verify `VITE_SENTRY_DEV="true"` for dev testing
4. Check browser console for Sentry warnings
5. Make sure error actually occurred (check Network tab)

### Too Many Errors?
Adjust sample rate in `src/config/sentry.ts`:
```typescript
tracesSampleRate: 0.1, // Only capture 10% of traces
replaysSessionSampleRate: 0.05, // Only 5% of sessions
```

### Want to Filter Out Certain Errors?
Edit `beforeSend` function in `src/config/sentry.ts`:
```typescript
beforeSend(event, hint) {
  const error = hint.originalException as Error;

  // Filter out specific errors
  if (error?.message?.includes('ResizeObserver')) {
    return null; // Don't send to Sentry
  }

  return event;
}
```

---

## Support

- **Sentry Docs**: https://docs.sentry.io/platforms/javascript/guides/react/
- **Capacitor Integration**: https://docs.sentry.io/platforms/javascript/guides/capacitor/
- **Community**: https://discord.gg/sentry

---

**Questions?** Contact dev@peacefulkids.app
