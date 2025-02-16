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
      const wpUrl = new URL(request.url);
      wpUrl.hostname = 'i0.wp.com';
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      
      // Giữ nguyên các query params hiện có và thêm format webp
      wpUrl.search = url.search;
      if (!wpUrl.searchParams.has('format')) {
        wpUrl.searchParams.append('format', 'webp');
      }

      try {
        const imageResponse = await fetch(wpUrl);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status}`);
        }

        // Tạo response mới với headers cơ bản
        const response = new Response(imageResponse.body, {
          headers: {
            'content-type': imageResponse.headers.get('content-type'),
            'cache-control': 'public, max-age=31536000',
            'cdn-cache-control': 'max-age=31536000'
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
