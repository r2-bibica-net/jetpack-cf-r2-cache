export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname === 'i.bibica.net') {
      const wpUrl = new URL(request.url);
      wpUrl.hostname = 'i0.wp.com';
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      wpUrl.search = url.search;
      
      const wpRequest = new Request(wpUrl.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'image/webp'
        }
      });

      const imageResponse = await fetch(wpRequest);
      const etagValue = `"${btoa(url.pathname + url.search)}"`;

      // Tạo response mới hoàn toàn với headers tối thiểu
      return new Response(imageResponse.body, {
        headers: {
          'content-type': 'image/webp',
          'Cache-Control': 'public, max-age=31536000, immutable, no-transform',
          'ETag': etagValue,
          'content-length': imageResponse.headers.get('content-length')
        }
      });
    }
    return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { status: 404 });
  }
};
