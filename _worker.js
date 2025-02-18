export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === 'i.bibica.net') {
      // Tạo cache key từ URL
      const cacheKey = `image:${url.pathname}${url.search}`;
      
      // Kiểm tra KV cache
      let cachedResponse = await env.IMAGE_CACHE.get(cacheKey, 'arrayBuffer');
      
      if (!cachedResponse) {
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
        const imageBuffer = await imageResponse.arrayBuffer();
        
        // Cache vào KV
        await env.IMAGE_CACHE.put(cacheKey, imageBuffer, {
          expirationTtl: 31536000
        });
        
        cachedResponse = imageBuffer;
      }
      
      return new Response(cachedResponse, {
        headers: {
          'content-type': 'image/webp',
          'Cache-Control': 'public, max-age=31536000'
        }
      });
    }
    return new Response(`Request not supported`, { status: 404 });
  }
};
