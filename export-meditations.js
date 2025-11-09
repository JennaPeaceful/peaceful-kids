import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read .env file manually
const envFile = fs.readFileSync('.env', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let value = match[2].trim();
    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    envVars[match[1].trim()] = value;
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function arrayToCSV(data, columns) {
  const header = columns.join(',');
  const rows = data.map(row =>
    columns.map(col => escapeCSV(row[col])).join(',')
  );
  return [header, ...rows].join('\n');
}

async function exportMeditations() {
  console.log('Fetching meditations from database...');

  const { data, error } = await supabase
    .from('meditations')
    .select('*')
    .order('id');

  if (error) {
    console.error('Error fetching meditations:', error);
    process.exit(1);
  }

  console.log(`Found ${data.length} meditations`);

  // Convert to CSV
  const columns = [
    'id', 'title', 'description', 'media_type', 'media_url',
    'category', 'age_group', 'themes', 'is_free', 'duration',
    'sort_order', 'courses', 'created_at', 'updated_at'
  ];

  const csv = arrayToCSV(data, columns);

  // Write to file
  const outputPath = '/Users/davidsonshine/Desktop/peaceful-kids-rebuild/exports/meditations-export.csv';
  fs.writeFileSync(outputPath, csv);

  console.log(`Exported to: ${outputPath}`);
  console.log('\nSummary:');
  console.log(`- Total meditations: ${data.length}`);

  const byType = data.reduce((acc, m) => {
    acc[m.media_type] = (acc[m.media_type] || 0) + 1;
    return acc;
  }, {});

  console.log('- By media type:');
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`  - ${type}: ${count}`);
  });

  const withCourses = data.filter(m => m.courses).length;
  console.log(`- With courses: ${withCourses}`);
  console.log(`- Without courses: ${data.length - withCourses}`);
}

exportMeditations().catch(console.error);
