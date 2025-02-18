export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname === 'i.bibica.net') {
      try {
        // Sử dụng URL làm cache key
        const cacheKey = request.url;
        const cache = await caches.default;
        
        // Kiểm tra cache
        let response = await cache.match(cacheKey);
        
        if (!response) {
          // Cache miss - fetch từ Jetpack
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
          
          if (!imageResponse.ok) {
            throw new Error(`Fetch failed: ${imageResponse.status}`);
          }

          // Tạo response mới với headers tối thiểu
          response = new Response(imageResponse.body, {
            headers: {
              'content-type': 'image/webp',
              'Cache-Control': 'public, max-age=31536000',
              'content-length': imageResponse.headers.get('content-length')
            }
          });

          // Cache response
          await cache.put(cacheKey, response.clone());
        }
        
        return response;
      } catch (error) {
        return new Response(`Error: ${error.message}`, { status: 500 });
      }
    }
    return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { status: 404 });
  }
};
