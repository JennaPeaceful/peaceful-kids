/**
 * R2 CDN Migration Script
 * Downloads assets from cdn.peacefulkids.app and uploads to new R2 bucket
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// All unique CDN URLs from database
const urls = [
  "https://cdn.peacefulmeditationapp.com/icons/png/Anger.png",
  "https://cdn.peacefulmeditationapp.com/icons/png/Anxiety-Worry.png",
  "https://cdn.peacefulmeditationapp.com/icons/png/Bedtime.png",
  "https://cdn.peacefulmeditationapp.com/icons/png/Calm.png",
  "https://cdn.peacefulmeditationapp.com/icons/png/Energize.png",
  "https://cdn.peacefulmeditationapp.com/icons/png/Family Change.png",
  "https://cdn.peacefulmeditationapp.com/icons/png/Focus.png",
  "https://cdn.peacefulmeditationapp.com/icons/png/Frustration.png",
  "https://cdn.peacefulmeditationapp.com/icons/png/Mindfulness Exercises Eating.png",
  "https://cdn.peacefulmeditationapp.com/icons/png/Mindfulness Exercises Grounding.png",
  "https://cdn.peacefulmeditationapp.com/icons/png/Mindfulness Exercises Teeth Brushing.png",
  "https://cdn.peacefulmeditationapp.com/icons/png/Mindfulness Exercises Walking.png",
  "https://cdn.peacefulmeditationapp.com/icons/png/Misellaneous.png",
  "https://cdn.peacefulmeditationapp.com/icons/png/Mornings.png",
  "https://cdn.peacefulmeditationapp.com/icons/png/Overwhelm.png",
  "https://cdn.peacefulmeditationapp.com/icons/png/Protetion.png",
  "https://cdn.peacefulmeditationapp.com/icons/png/Reset.png",
  "https://cdn.peacefulmeditationapp.com/icons/png/Rest.png",
  "https://cdn.peacefulmeditationapp.com/icons/png/Sadness.png",
  "https://cdn.peacefulmeditationapp.com/icons/png/Scared.png",
  "https://cdn.peacefulmeditationapp.com/icons/png/Separation Anxiety.png",
  "https://cdn.peacefulmeditationapp.com/icons/png/Sports.png",
  "https://cdn.peacefulmeditationapp.com/icons/png/Stress.png",
  "https://cdn.peacefulmeditationapp.com/icons/png/Upset.png",
  "https://cdn.peacefulmeditationapp.com/icons/svg/Anger.svg",
  "https://cdn.peacefulmeditationapp.com/icons/svg/Anxiety-Worry.svg",
  "https://cdn.peacefulmeditationapp.com/icons/svg/Bedtime.svg",
  "https://cdn.peacefulmeditationapp.com/icons/svg/Calm.svg",
  "https://cdn.peacefulmeditationapp.com/icons/svg/Energize.svg",
  "https://cdn.peacefulmeditationapp.com/icons/svg/Family Change.svg",
  "https://cdn.peacefulmeditationapp.com/icons/svg/Focus.svg",
  "https://cdn.peacefulmeditationapp.com/icons/svg/Frustration.svg",
  "https://cdn.peacefulmeditationapp.com/icons/svg/Mindfulness Exercises Eating.svg",
  "https://cdn.peacefulmeditationapp.com/icons/svg/Mindfulness Exercises Grounding.svg",
  "https://cdn.peacefulmeditationapp.com/icons/svg/Mindfulness Exercises Teeth Brushing.svg",
  "https://cdn.peacefulmeditationapp.com/icons/svg/Mindfulness Exercises Walking.svg",
  "https://cdn.peacefulmeditationapp.com/icons/svg/Misellaneous.svg",
  "https://cdn.peacefulmeditationapp.com/icons/svg/Mornings.svg",
  "https://cdn.peacefulmeditationapp.com/icons/svg/Overwhelm.svg",
  "https://cdn.peacefulmeditationapp.com/icons/svg/Protetion.svg",
  "https://cdn.peacefulmeditationapp.com/icons/svg/Reset.svg",
  "https://cdn.peacefulmeditationapp.com/icons/svg/Rest.svg",
  "https://cdn.peacefulmeditationapp.com/icons/svg/Sadness.svg",
  "https://cdn.peacefulmeditationapp.com/icons/svg/Scared.svg",
  "https://cdn.peacefulmeditationapp.com/icons/svg/Separation Anxiety.svg",
  "https://cdn.peacefulmeditationapp.com/icons/svg/Sports.svg",
  "https://cdn.peacefulmeditationapp.com/icons/svg/Stress.svg",
  "https://cdn.peacefulmeditationapp.com/icons/svg/Upset.svg"
];

// Convert new CDN URLs to old CDN URLs
const oldUrls = urls.map(url => url.replace('cdn.peacefulmeditationapp.com', 'cdn.peacefulkids.app'));

const tempDir = '/tmp/r2-migration';

// Create temp directory
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

console.log(`Starting migration of ${oldUrls.length} assets...`);
console.log(`Temp directory: ${tempDir}`);

let completed = 0;
let failed = 0;
const failedUrls = [];

// Process each URL
for (const oldUrl of oldUrls) {
  try {
    // Extract path from URL
    const urlPath = oldUrl.replace('https://cdn.peacefulkids.app/', '');
    const localPath = path.join(tempDir, urlPath);
    const r2Path = `r2-new:peacefulmeditationapp/${urlPath}`;

    console.log(`\n[${completed + failed + 1}/${oldUrls.length}] Processing: ${urlPath}`);

    // Create local directory structure
    const localDir = path.dirname(localPath);
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }

    // Download file using curl (more reliable than https for large files)
    console.log(`  Downloading from ${oldUrl}...`);
    execSync(`curl -s -f -L "${oldUrl}" -o "${localPath}"`, { stdio: 'inherit' });

    // Check if file was downloaded
    if (!fs.existsSync(localPath) || fs.statSync(localPath).size === 0) {
      throw new Error('File download failed or empty');
    }

    const fileSize = fs.statSync(localPath).size;
    console.log(`  Downloaded: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);

    // Upload to R2 using rclone
    console.log(`  Uploading to R2: ${r2Path}...`);
    execSync(`rclone copy "${localPath}" "${path.dirname(r2Path)}"`, { stdio: 'inherit' });

    // Cleanup local file
    fs.unlinkSync(localPath);

    completed++;
    console.log(`  ✓ Success (${completed} completed, ${failed} failed)`);

  } catch (error) {
    failed++;
    failedUrls.push(oldUrl);
    console.error(`  ✗ Failed: ${error.message}`);
  }
}

console.log(`\n\n=== Migration Complete ===`);
console.log(`Completed: ${completed}/${oldUrls.length}`);
console.log(`Failed: ${failed}/${oldUrls.length}`);

if (failedUrls.length > 0) {
  console.log(`\nFailed URLs:`);
  failedUrls.forEach(url => console.log(`  - ${url}`));
}

// Cleanup temp directory
try {
  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log(`\nCleaned up temp directory: ${tempDir}`);
} catch (e) {
  console.log(`\nNote: Could not clean up temp directory: ${e.message}`);
}
