export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Chỉ xử lý các request tới images.bibica.net
    if (url.hostname === 'images.bibica.net') {
      // Check cache trước
      const cache = caches.default;
      const cachedResponse = await cache.match(request);
      
      if (cachedResponse) {
        return cachedResponse;
      }

      // Nếu chưa có trong cache, tạo request tới i0.wp.com
      const wpUrl = new URL(request.url);
      wpUrl.hostname = 'i0.wp.com';
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      wpUrl.search = url.search; // giữ nguyên query params (?w=450)

      try {
        const imageResponse = await fetch(wpUrl);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status}`);
        }

        // Tạo response mới với cache headers
        const response = new Response(imageResponse.body, {
          headers: {
            'content-type': imageResponse.headers.get('content-type'),
            'cache-control': 'public, max-age=31536000',
            'cdn-cache-control': 'max-age=31536000'
          }
        });

        // Lưu vào cache
        await cache.put(request, response.clone());
        
        return response;
      } catch (error) {
        console.error('Error:', error);
        // Nếu có lỗi, fallback về i0.wp.com
        return fetch(new Request(wpUrl, request));
      }
    }

    // Xử lý các request không phải images.bibica.net
    return new Response('Not Found', { status: 404 });
  }
};
