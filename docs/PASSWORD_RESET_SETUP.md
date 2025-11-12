# Password Reset Configuration Guide

This guide explains how to configure password reset functionality in the Supabase Dashboard.

## Prerequisites

- Access to your Supabase Dashboard (`https://supabase.com/dashboard`)
- Your project: `cvlsvztdyuqzutzwtank`

---

## Supabase Dashboard Configuration

### Step 1: Configure Redirect URLs

1. **Navigate to Authentication Settings**
   - Go to https://supabase.com/dashboard/project/cvlsvztdyuqzutzwtank/auth/url-configuration
   - Or: Dashboard → Project → Authentication → URL Configuration

2. **Add Redirect URLs**

   Add the following URLs to the **Redirect URLs** list:

   **Production:**
   ```
   https://your-production-domain.com/reset-password
   https://your-production-domain.com/**
   ```

   **Development:**
   ```
   http://localhost:5173/reset-password
   http://localhost:5173/**
   ```

   **Mobile App (if using Capacitor):**
   ```
   peacefulkids://reset-password
   peacefulkids://**
   ```

3. **Save Changes**

---

### Step 2: Customize Email Templates (Optional)

1. **Navigate to Email Templates**
   - Go to: Dashboard → Authentication → Email Templates
   - Or: https://supabase.com/dashboard/project/cvlsvztdyuqzutzwtank/auth/templates

2. **Select "Reset Password" Template**

3. **Customize the Template (Optional)**

   Default template includes:
   - Subject: Reset Your Password
   - HTML email with reset link
   - Link format: `{{ .ConfirmationURL }}`

   **Recommended customizations:**
   - Add your app branding/logo
   - Customize colors to match app theme
   - Update copy to match your brand voice
   - Add support contact information

4. **Example Custom Template:**

   ```html
   <!DOCTYPE html>
   <html>
   <head>
     <style>
       body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
       .container { max-width: 600px; margin: 0 auto; padding: 20px; }
       .button {
         display: inline-block;
         padding: 12px 24px;
         background-color: #8B45FF;
         color: white;
         text-decoration: none;
         border-radius: 6px;
       }
       .footer { margin-top: 20px; font-size: 12px; color: #666; }
     </style>
   </head>
   <body>
     <div class="container">
       <h2>Reset Your Password</h2>
       <p>Hi there,</p>
       <p>You requested to reset your password for your Peaceful Kids account.</p>
       <p>Click the button below to create a new password:</p>
       <p>
         <a href="{{ .ConfirmationURL }}" class="button">
           Reset Password
         </a>
       </p>
       <p>This link will expire in 60 minutes.</p>
       <p>If you didn't request this, you can safely ignore this email.</p>
       <div class="footer">
         <p>Need help? Contact us at support@peacefulkids.app</p>
       </div>
     </div>
   </body>
   </html>
   ```

5. **Save Template**

---

### Step 3: Configure Email Settings

1. **Navigate to Auth Settings**
   - Dashboard → Authentication → Settings

2. **Verify Email Configuration**

   Check the following settings:
   - **Enable Email Confirmations**: Can be ON or OFF (your choice)
   - **Secure Email Change**: Recommended: ON
   - **Email Rate Limit**: Default is fine (prevents abuse)

3. **Custom SMTP (Optional but Recommended for Production)**

   For better email deliverability in production:
   - Navigate to: Project Settings → Authentication → SMTP Settings
   - Configure with your email provider (SendGrid, Mailgun, etc.)
   - Test email delivery

---

### Step 4: Test Password Reset Flow

1. **Web Testing:**
   ```bash
   npm run dev
   ```
   - Go to http://localhost:5173
   - Click "Sign In"
   - Click "Forgot Password?"
   - Enter a test email
   - Check inbox for reset email
   - Click link → should redirect to `/reset-password`
   - Enter new password
   - Verify you can sign in with new password

2. **Production Testing:**
   - Deploy code to production
   - Test complete flow on live domain
   - Verify email links work correctly

---

## Mobile App Configuration (Capacitor)

If you're deploying to iOS/Android, additional configuration is needed for deep linking.

### iOS Configuration

1. **Update `capacitor.config.ts`:**

   ```typescript
   const config: CapacitorConfig = {
     appId: 'com.peacefulkids.app',
     appName: 'Peaceful Kids',
     webDir: 'dist',
     server: {
       url: 'https://your-production-domain.com',
       cleartext: true
     },
     plugins: {
       App: {
         customURLScheme: 'peacefulkids'
       }
     }
   };
   ```

2. **Update `Info.plist` (iOS)**

   Add to `ios/App/App/Info.plist`:
   ```xml
   <key>CFBundleURLTypes</key>
   <array>
     <dict>
       <key>CFBundleURLSchemes</key>
       <array>
         <string>peacefulkids</string>
       </array>
     </dict>
   </array>
   ```

### Android Configuration

1. **Update `AndroidManifest.xml`**

   Add to `android/app/src/main/AndroidManifest.xml`:
   ```xml
   <intent-filter android:autoVerify="true">
     <action android:name="android.intent.action.VIEW" />
     <category android:name="android.intent.category.DEFAULT" />
     <category android:name="android.intent.category.BROWSABLE" />
     <data android:scheme="peacefulkids" />
     <data android:host="reset-password" />
   </intent-filter>
   ```

2. **Rebuild Mobile Apps:**
   ```bash
   npm run build
   npx cap sync
   npx cap open ios    # For iOS
   npx cap open android # For Android
   ```

---

## Security Considerations

### Password Requirements

The implementation enforces:
- ✅ Minimum 6 characters (Supabase default)
- ✅ Password strength indicator
- ✅ Password confirmation match validation

### Rate Limiting

Supabase automatically rate-limits password reset requests to prevent abuse:
- Default: 4 requests per hour per email
- Can be configured in Dashboard → Authentication → Settings

### Token Expiration

Password reset tokens expire after **60 minutes** by default.

---

## Troubleshooting

### Common Issues

1. **"Invalid or expired reset link"**
   - Token expired (> 60 minutes old)
   - User already used the link
   - Solution: Request new reset email

2. **Redirect not working**
   - Check URL is in allowed redirect URLs list
   - Verify redirect URL format matches exactly
   - Check for typos in Supabase dashboard

3. **Email not received**
   - Check spam folder
   - Verify SMTP settings (if custom SMTP configured)
   - Check Supabase logs for email delivery errors
   - Verify rate limits not exceeded

4. **Mobile deep link not working**
   - Verify `capacitor.config.ts` has correct scheme
   - Check platform-specific configuration (Info.plist / AndroidManifest.xml)
   - Rebuild and reinstall app after config changes

---

## Testing Checklist

- [ ] Web: Forgot password link appears in sign-in modal
- [ ] Web: Email sent successfully
- [ ] Web: Reset email received
- [ ] Web: Clicking email link redirects to `/reset-password`
- [ ] Web: Password reset form works
- [ ] Web: Can sign in with new password
- [ ] Profile: "Change Password" button works for logged-in users
- [ ] Mobile (iOS): Deep link opens app to reset password page
- [ ] Mobile (Android): Deep link opens app to reset password page
- [ ] Production: All above tests pass on live domain

---

## Support

If you encounter issues:
1. Check Supabase Dashboard → Logs for errors
2. Check browser console for JavaScript errors
3. Verify all configuration steps completed
4. Test with different email addresses

For Supabase-specific issues:
- Documentation: https://supabase.com/docs/guides/auth/passwords
- Support: https://supabase.com/support
