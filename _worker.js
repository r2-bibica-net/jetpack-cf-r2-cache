export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.hostname === 'images.bibica.net') {
      // Check cache
      const cache = caches.default;
      const cachedResponse = await cache.match(request);
      
      if (cachedResponse) {
        return cachedResponse;
      }

      // Tạo URL cho i0.wp.com
      const wpUrl = new URL('https://i0.wp.com/bibica.net/wp-content/uploads' + url.pathname);
      wpUrl.search = url.search; // giữ nguyên query params (ví dụ ?w=450)

      try {
        // Forward luôn Accept header từ request gốc
        const imageResponse = await fetch(wpUrl, {
          headers: {
            'Accept': request.headers.get('Accept') || '*/*'
          }
        });
        
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status}`);
        }

        // Tạo response mới với headers cơ bản
        const response = new Response(imageResponse.body, {
          headers: {
            'content-type': imageResponse.headers.get('content-type'),
            'cache-control': 'public, max-age=31536000',
            'cdn-cache-control': 'max-age=31536000',
            'vary': 'Accept'  // Quan trọng để cache phù hợp với Accept header
          }
        });

        // Cache response
        await cache.put(request, response.clone());
        
        return response;
      } catch (error) {
        console.error('Error:', error);
        return fetch(new Request(wpUrl, request));
      }
    }

    return new Response('Not Found', { status: 404 });
  }
};
