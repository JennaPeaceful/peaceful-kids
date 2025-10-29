/**
 * Debug Script: Check User Subscription
 *
 * This script checks a user's subscription status in Supabase
 * to debug why they might have unexpected access
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cvlsvztdyuqzutzwtank.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bHN2enRkeXVxenV0end0YW5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NDA5NDEsImV4cCI6MjA3MzExNjk0MX0.2g1Aw2Kij_9qc0T2_0Zpj22nahieUm4eg388ZGvpVC0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugUserSubscription(userEmail) {
  console.log('🔍 Debugging subscription for:', userEmail);
  console.log('─'.repeat(60));

  // Find user by email
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error('❌ Error fetching users:', authError.message);
    console.log('\n⚠️  Note: admin.listUsers() requires service role key, not anon key');
    console.log('💡 Alternative: Provide the user_id directly instead of email\n');
    return;
  }

  const user = authUsers.users.find(u => u.email === userEmail);

  if (!user) {
    console.log('❌ User not found with email:', userEmail);
    return;
  }

  console.log('✅ Found user:');
  console.log('   ID:', user.id);
  console.log('   Email:', user.email);
  console.log('   Created:', user.created_at);
  console.log('');

  // Check user_subscriptions table
  const { data: subscription, error: subError } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (subError && subError.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('❌ Error fetching subscription:', subError.message);
    return;
  }

  if (!subscription) {
    console.log('⚠️  No subscription record found');
    console.log('   This means the user should have free access only');
  } else {
    console.log('📋 Subscription Record:');
    console.log('   ID:', subscription.id);
    console.log('   Plan Type:', subscription.plan_type);
    console.log('   Is Active:', subscription.is_active);
    console.log('   Created:', subscription.created_at);
    console.log('   Updated:', subscription.updated_at);
    console.log('');

    // Analyze the issue
    if (subscription.is_active && subscription.plan_type !== 'free') {
      console.log('🚨 PROBLEM FOUND:');
      console.log('   User has active', subscription.plan_type, 'without a purchase!');
      console.log('');
      console.log('🔧 Possible causes:');
      console.log('   1. Test purchase was made on iOS/Android');
      console.log('   2. Database was manually edited');
      console.log('   3. Old migration script set wrong values');
      console.log('   4. Bug in syncSubscription logic');
    } else if (!subscription.is_active && subscription.plan_type !== 'free') {
      console.log('✅ Subscription looks correct (inactive premium plan)');
    } else {
      console.log('✅ Subscription looks correct (free plan)');
    }
  }
}

// Alternative: Debug by user_id directly
async function debugByUserId(userId) {
  console.log('🔍 Debugging subscription for user_id:', userId);
  console.log('─'.repeat(60));

  const { data: subscription, error: subError } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (subError && subError.code !== 'PGRST116') {
    console.error('❌ Error fetching subscription:', subError.message);
    return;
  }

  if (!subscription) {
    console.log('⚠️  No subscription record found');
    console.log('   This user should have free access only');
  } else {
    console.log('📋 Subscription Record:');
    console.log('   ID:', subscription.id);
    console.log('   Plan Type:', subscription.plan_type);
    console.log('   Is Active:', subscription.is_active);
    console.log('   Created:', subscription.created_at);
    console.log('   Updated:', subscription.updated_at);
    console.log('');

    if (subscription.is_active && subscription.plan_type !== 'free') {
      console.log('🚨 PROBLEM FOUND:');
      console.log('   User has active', subscription.plan_type, 'without a purchase!');
    } else {
      console.log('✅ Subscription looks correct');
    }
  }
}

// Run the script
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage:');
  console.log('  node debug-subscription.js <email>');
  console.log('  node debug-subscription.js --id <user_id>');
  console.log('');
  console.log('Examples:');
  console.log('  node debug-subscription.js test@example.com');
  console.log('  node debug-subscription.js --id 123e4567-e89b-12d3-a456-426614174000');
  process.exit(1);
}

if (args[0] === '--id') {
  debugByUserId(args[1]);
} else {
  debugUserSubscription(args[0]);
}
