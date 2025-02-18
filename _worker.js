export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname === 'i.bibica.net') {
      // Normalize URL
      const wpUrl = new URL(request.url);
      wpUrl.hostname = 'i0.wp.com';
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      wpUrl.search = url.search;

      // Tạo request mới với chỉ Accept header
      const wpRequest = new Request(wpUrl.toString(), {
        method: 'GET',
        duplex: 'half',
        headers: {
          'Accept': 'image/webp'
        }
      });

      const imageResponse = await fetch(wpRequest);

      // Return response với minimal headers
      return new Response(imageResponse.body, {
        headers: {
          'content-type': 'image/webp',
          'Cache-Control': 'public, max-age=31536000'
        }
      });
    }
    return new Response(`Request not supported`, { status: 404 });
  }
};
