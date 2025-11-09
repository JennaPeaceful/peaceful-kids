import fs from 'fs';

// Read the database export
const dbCSV = fs.readFileSync('/Users/davidsonshine/Desktop/peaceful-kids-rebuild/exports/meditations-export.csv', 'utf8');
const dbLines = dbCSV.split('\n');
const dbHeaders = dbLines[0].split(',');
const dbData = dbLines.slice(1).filter(line => line.trim()).map(line => {
  // Simple CSV parsing (won't handle complex cases perfectly but should work)
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);

  return values;
});

console.log('\n=== DATABASE EXPORT ANALYSIS ===');
console.log(`Total meditations in database: ${dbData.length}`);

// Extract titles from database
const dbTitles = new Set();
dbData.forEach(row => {
  const titleIndex = dbHeaders.indexOf('title');
  if (titleIndex >= 0 && row[titleIndex]) {
    dbTitles.add(row[titleIndex].toLowerCase().trim());
  }
});

console.log(`Unique titles in database: ${dbTitles.size}`);

// Read source CSV - this is trickier because it has a different format
const sourceCSV = fs.readFileSync('/Users/davidsonshine/Downloads/Peaceful Kids Source Index - Peaceful Kids Data (6).csv', 'utf8');
const sourceLines = sourceCSV.split('\n');

// Find the header line (first line)
const sourceHeaders = sourceLines[0].split(',');
console.log('\n=== SOURCE CSV ANALYSIS ===');
console.log(`Headers found: ${sourceHeaders.slice(0, 5).join(', ')}...`);

// Parse source CSV
const sourceItems = [];
for (let i = 1; i < sourceLines.length; i++) {
  const line = sourceLines[i];
  if (!line.trim()) continue;

  const values = [];
  let current = '';
  let inQuotes = false;

  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);

  // Get relevant fields
  const publicTitle = values[11] || ''; // Public Title column
  const itemName = values[3] || '';      // Item Name column
  const fileType = values[5] || '';      // File Type column

  if (publicTitle.trim() || itemName.trim()) {
    sourceItems.push({
      publicTitle: publicTitle.trim(),
      itemName: itemName.trim(),
      fileType: fileType.trim(),
      line: i + 1
    });
  }
}

console.log(`Total items in source CSV: ${sourceItems.length}`);

// Find items in source but not in database
const missing = [];
const worksheets = [];

sourceItems.forEach(item => {
  const title = item.publicTitle || item.itemName;
  if (!title) return;

  const titleLower = title.toLowerCase().trim();

  // Check for worksheets
  if (titleLower.includes('worksheet') || item.itemName.toLowerCase().includes('worksheet')) {
    worksheets.push(item);
  }

  // Check if in database
  if (!dbTitles.has(titleLower)) {
    missing.push(item);
  }
});

console.log(`\n=== WORKSHEETS IN SOURCE CSV ===`);
console.log(`Total worksheets found: ${worksheets.length}`);
worksheets.forEach(w => {
  console.log(`  Line ${w.line}: ${w.publicTitle || w.itemName} (${w.fileType})`);
});

console.log(`\n=== MISSING FROM DATABASE ===`);
console.log(`Total items in source but not in database: ${missing.length}`);
console.log('\nFirst 20 missing items:');
missing.slice(0, 20).forEach(item => {
  console.log(`  Line ${item.line}: ${item.publicTitle || item.itemName} (${item.fileType})`);
});

// Write detailed report
const report = {
  summary: {
    dbTotal: dbData.length,
    sourceTotal: sourceItems.length,
    worksheets: worksheets.length,
    missing: missing.length
  },
  worksheets,
  missing: missing.slice(0, 50) // First 50 missing items
};

fs.writeFileSync(
  '/Users/davidsonshine/Desktop/peaceful-kids-rebuild/exports/comparison-report.json',
  JSON.stringify(report, null, 2)
);

console.log('\n\nDetailed report written to: /Users/davidsonshine/Desktop/peaceful-kids-rebuild/exports/comparison-report.json');
