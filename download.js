const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function downloadImage(url) {
  try {
    const urlObj = new URL(url);
    const width = urlObj.searchParams.get('w');
    
    const response = await fetch(url, {
      headers: { 'Accept': 'image/webp' }
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const buffer = await response.buffer();
    const pathname = urlObj.pathname;
    
    // Tạo filename với width
    const basename = path.basename(pathname, '.jpg');
    const filename = `${basename}-w${width}.webp`;
    const filepath = path.join('images', path.dirname(pathname), filename);
    
    fs.mkdirSync(path.dirname(filepath), { recursive: true });
    fs.writeFileSync(filepath, buffer);
    
    console.log(`Downloaded: ${filepath}`);
  } catch (error) {
    console.error(`Error downloading ${url}:`, error);
  }
}
