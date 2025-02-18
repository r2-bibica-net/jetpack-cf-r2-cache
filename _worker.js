export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname === 'i.bibica.net') {
      const wpUrl = new URL(request.url);
      wpUrl.hostname = 'i0.wp.com';
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      wpUrl.search = url.search;

      // Tạo một "clean" request, không copy headers từ request gốc
      const cleanRequest = new Request(wpUrl.toString(), {
        method: 'GET',
        headers: new Headers()
      });
      
      // Forward request đến Jetpack
      const wpRequest = new Request(cleanRequest, {
        headers: {
          'Accept': 'image/webp',
          'User-Agent': 'Cloudflare-Worker',
          'Accept-Encoding': 'gzip'
        }
      });

      const imageResponse = await fetch(wpRequest);

      // Tạo response mới với minimal headers
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
