export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname === 'i.bibica.net') {
      const wpUrl = new URL(request.url);
      wpUrl.hostname = 'i0.wp.com';
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      wpUrl.search = url.search;
      
      // Tạo cache key đơn giản chỉ từ pathname và search
      const cacheKey = `${url.pathname}${url.search}`;
      
      let cache = caches.default;
      let response = await cache.match(cacheKey);
      
      if (!response) {
        const wpRequest = new Request(wpUrl.toString(), {
          method: 'GET',
          headers: {
            'Accept': 'image/webp'
          }
        });

        const imageResponse = await fetch(wpRequest);
        response = new Response(imageResponse.body, {
          headers: {
            'content-type': 'image/webp',
            'Cache-Control': 'public, max-age=31536000, immutable, no-transform',
            'content-length': imageResponse.headers.get('content-length')
          }
        });
        
        // Clone response trước khi cache
        await cache.put(cacheKey, response.clone());
      }
      
      return response;
    }
    return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { status: 404 });
  }
};
