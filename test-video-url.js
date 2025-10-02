const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://cvlsvztdyuqzutzwtank.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bHN2enRkeXVxenV0end0YW5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY1MTUyODYsImV4cCI6MjA0MjA5MTI4Nn0.3Vo-jkXPQ8KFLBmLWAGPcG7o3QQxbNW5bXbKqN1pXfg'
);

(async () => {
  const { data, error } = await supabase
    .from('meditations')
    .select('media_url, media_type, title, duration')
    .eq('media_type', 'video')
    .order('duration', { ascending: false })
    .limit(1);
  
  if (error) {
    console.error('Error:', error);
  } else if (data && data.length > 0) {
    console.log('Longest video found:');
    console.log(JSON.stringify(data[0], null, 2));
  }
})();
