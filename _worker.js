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
        },
        // Tùy chỉnh cache key chỉ dựa trên URL
        cf: {
          cacheKey: wpUrl.toString(), // Chỉ sử dụng URL làm cache key
          cacheEverything: true // Bắt Cloudflare cache response
        }
      });

      const imageResponse = await fetch(wpRequest);

      // Chỉ giữ lại các headers cần thiết nhất
      return new Response(imageResponse.body, {
        headers: {
          'content-type': 'image/webp',
          'Cache-Control': 'public, max-age=31536000'
        }
      });
    }
    return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { status: 404 });
  }
};
