export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    if (url.hostname === 'i.bibica.net') {
      const wpUrl = new URL(request.url);
      wpUrl.hostname = 'i0.wp.com';
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      wpUrl.search = url.search;

      // Cố định các header để nhận về cùng một phiên bản của ảnh
      const imageResponse = await fetch(wpUrl, {
        headers: {
          'Accept': 'image/webp', // Cố định format là JPEG
          'Accept-Encoding': 'identity', // Không nén
          'User-Agent': 'Mozilla/5.0' // User agent cố định
        }
      });
      
      return new Response(imageResponse.body, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Accept-Ranges': 'bytes',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    return new Response('Not found', { status: 404 });
  }
};
