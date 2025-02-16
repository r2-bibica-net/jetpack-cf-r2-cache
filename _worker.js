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

      // Tạo URL cho i0.wp.com - CHÚ Ý: không thêm /wp-content/uploads vào pathname
      const wpUrl = new URL('https://i0.wp.com/bibica.net/wp-content/uploads' + url.pathname);
      
      // Giữ nguyên các query params hiện có và thêm format webp
      const searchParams = new URLSearchParams(url.search);
      if (!searchParams.has('format')) {
        searchParams.append('format', 'webp');
      }
      wpUrl.search = searchParams.toString();

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
