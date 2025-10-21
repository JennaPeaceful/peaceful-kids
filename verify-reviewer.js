// Script to verify the reviewer account in Supabase
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cvlsvztdyuqzutzwtank.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bHN2enRkeXVxenV0end0YW5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NDA5NDEsImV4cCI6MjA3MzExNjk0MX0.2g1Aw2Kij_9qc0T2_0Zpj22nahieUm4eg388ZGvpVC0";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const EXPECTED_REVIEWER = {
  email: 'reviewer@peaceful.app',
  userId: '1e09fc33-3e67-436a-a0cd-8a7a5f027df8',
  plan: 'Peace Plus Plan'
};

async function verifyReviewerAccount() {
  console.log('🔍 Checking for reviewer account in Supabase...\n');

  try {
    // Check if user exists in user_profiles table
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', EXPECTED_REVIEWER.userId);

    if (profileError) {
      console.log('❌ Error querying database');
      console.log('Error:', profileError.message);
      return false;
    }

    if (!profiles || profiles.length === 0) {
      console.log('❌ Profile NOT FOUND');
      console.log('\n⚠️  ACTION REQUIRED: Create reviewer account with:');
      console.log('   - Email:', EXPECTED_REVIEWER.email);
      console.log('   - User ID:', EXPECTED_REVIEWER.userId);
      console.log('   - Plan:', EXPECTED_REVIEWER.plan);
      console.log('\nTo create the account:');
      console.log('1. Go to Supabase Dashboard → Authentication → Users');
      console.log('2. Create a new user with the email above');
      console.log('3. Set password to: ReviewTest123!');
      console.log('4. Add Peace Plus subscription to the account');
      return false;
    }

    const profile = profiles[0];

    console.log('✅ Profile found!');
    console.log('   - User ID:', profile.id);
    console.log('   - Email:', profile.email || 'N/A');
    console.log('   - Full Name:', profile.full_name || 'N/A');
    console.log('   - Subscription Tier:', profile.subscription_tier || 'none');
    console.log('   - Created:', profile.created_at);

    // Check subscription status
    const { data: subscriptions, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', EXPECTED_REVIEWER.userId);

    if (subError) {
      console.log('\n⚠️  Could not check subscriptions:', subError.message);
    } else if (subscriptions && subscriptions.length > 0) {
      console.log('\n📱 Subscriptions:');
      subscriptions.forEach(sub => {
        console.log('   - Plan:', sub.plan_name || sub.product_id);
        console.log('   - Status:', sub.status);
        console.log('   - Expires:', sub.expires_at || 'N/A');
        console.log('   - Active:', sub.is_active ? '✅ Yes' : '❌ No');
      });
    } else {
      console.log('\n⚠️  No subscriptions found');
      console.log('   ACTION REQUIRED: Add Peace Plus subscription to this account');
    }

    // Verify expected values
    console.log('\n📋 Verification Summary:');
    const hasCorrectId = profile.id === EXPECTED_REVIEWER.userId;
    const hasSubscription = subscriptions && subscriptions.length > 0 && subscriptions.some(s => s.is_active);

    console.log('   ✓ User ID matches:', hasCorrectId ? '✅' : '❌');
    console.log('   ✓ Active subscription:', hasSubscription ? '✅' : '❌');

    if (hasCorrectId && hasSubscription) {
      console.log('\n🎉 Reviewer account is properly configured!');
      return true;
    } else {
      console.log('\n⚠️  Reviewer account needs updates (see details above)');
      return false;
    }

  } catch (error) {
    console.error('❌ Error checking account:', error);
    return false;
  }
}

// Run the verification
verifyReviewerAccount()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
