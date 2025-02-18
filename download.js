const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function downloadImage(url) {
  const response = await fetch(url);
  const buffer = await response.buffer();
  
  // Giữ nguyên cấu trúc path từ URL
  const filepath = path.join('images', new URL(url).pathname);
  
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, buffer);
  console.log(`Downloaded: ${filepath}`);
}
