const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function downloadImage(url) {
  try {
    // Convert URL sang Jetpack
    const wpUrl = new URL(url);
    wpUrl.hostname = 'i0.wp.com';
    wpUrl.pathname = '/bibica.net/wp-content/uploads' + wpUrl.pathname;
    wpUrl.search = url.search;

    console.log('Downloading from:', wpUrl.toString());

    const response = await fetch(wpUrl.toString(), {
      headers: { 'Accept': 'image/webp' }
    });

    if (!response.ok) {
      throw new Error(`Failed to download: ${response.status}`);
    }

    const buffer = await response.buffer();
    const filepath = path.join('public', wpUrl.pathname);
    
    fs.mkdirSync(path.dirname(filepath), { recursive: true });
    fs.writeFileSync(filepath, buffer);
    
    console.log(`Downloaded to: ${filepath}`);
    return filepath;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

if (require.main === module) {
  const imageUrl = process.argv[2];
  if (!imageUrl) {
    console.error('Please provide an image URL');
    process.exit(1);
  }

  downloadImage(imageUrl)
    .then(() => console.log('Done'))
    .catch(() => process.exit(1));
}

module.exports = { downloadImage };
