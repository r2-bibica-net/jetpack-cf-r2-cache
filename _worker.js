export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    if (url.hostname === 'i.bibica.net') {
      const wpUrl = new URL(request.url);
      wpUrl.hostname = 'i0.wp.com';
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      wpUrl.search = url.search;

      const imageResponse = await fetch(wpUrl);
      
      // Tạo response mới với cache headers được kiểm soát
      return new Response(imageResponse.body, {
        headers: {
          'Content-Type': imageResponse.headers.get('Content-Type'),
          'Cache-Control': 'public, max-age=31536000, immutable',
          'ETag': imageResponse.headers.get('ETag'),
          'Last-Modified': imageResponse.headers.get('Last-Modified'),
          'Accept-Ranges': 'bytes',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    return new Response('Not found', { status: 404 });
  }
};
