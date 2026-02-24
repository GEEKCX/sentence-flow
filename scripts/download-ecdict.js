const https = require('https');
const fs = require('fs');
const path = require('path');

const ECDICT_URL = 'https://raw.githubusercontent.com/skywind3000/ECDICT/master/ecdict.csv';
const OUTPUT_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'ecdict.csv');

function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading from: ${url}`);

    const file = fs.createWriteStream(destination);
    let downloadedBytes = 0;
    let totalBytes = 0;

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      totalBytes = parseInt(response.headers['content-length'], 10);
      console.log(`File size: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);

      response.pipe(file);

      response.on('data', (chunk) => {
        downloadedBytes += chunk.length;
        const progress = ((downloadedBytes / totalBytes) * 100).toFixed(1);
        process.stdout.write(`\rProgress: ${progress}% (${(downloadedBytes / 1024 / 1024).toFixed(2)} MB / ${(totalBytes / 1024 / 1024).toFixed(2)} MB)`);
      });

      file.on('finish', () => {
        console.log('\n\nDownload complete!');
        resolve();
      });

      file.on('error', (error) => {
        fs.unlink(destination, () => {});
        reject(error);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function main() {
  try {
    if (!fs.existsSync(OUTPUT_DIR)) {
      console.log(`Creating directory: ${OUTPUT_DIR}`);
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    if (fs.existsSync(OUTPUT_FILE)) {
      console.log(`File already exists: ${OUTPUT_FILE}`);
      const shouldOverwrite = process.argv.includes('--force');

      if (!shouldOverwrite) {
        console.log('\nUse --force to overwrite the existing file.');
        console.log('Example: npm run download-ecdict -- --force');
        process.exit(0);
      }

      console.log('\nOverwriting existing file...');
      fs.unlinkSync(OUTPUT_FILE);
    }

    await downloadFile(ECDICT_URL, OUTPUT_FILE);

    const stats = fs.statSync(OUTPUT_FILE);
    console.log(`\nFile saved: ${OUTPUT_FILE}`);
    console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

    console.log('\nNext steps:');
    console.log('1. Run: npm run convert-ecdict');
    console.log('2. This will convert the CSV to JSON and create the index');
    console.log('3. Move the generated ecdict.json to public/dicts/');

  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { downloadFile };
