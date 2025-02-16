export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.hostname === 'images.bibica.net') {
      // Kiểm tra browser có hỗ trợ WebP không
      const acceptHeader = request.headers.get('Accept') || '';
      const supportsWebP = acceptHeader.includes('image/webp');
      
      // Tạo cache key dựa trên URL và WebP support
      const cacheKey = new Request(request.url, {
        headers: {
          'Accept': acceptHeader,
          'WebP-Support': supportsWebP ? '1' : '0'
        }
      });

      // Check cache
      const cache = caches.default;
      const cachedResponse = await cache.match(cacheKey);
      
      if (cachedResponse) {
        return cachedResponse;
      }

      // Tạo URL cho i0.wp.com
      const wpUrl = new URL(request.url);
      wpUrl.hostname = 'i0.wp.com';
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      
      // Giữ nguyên các query params hiện có
      wpUrl.search = url.search;
      
      // Thêm param để yêu cầu WebP nếu browser hỗ trợ
      if (supportsWebP) {
        wpUrl.searchParams.append('format', 'webp');
      }

      try {
        const imageResponse = await fetch(wpUrl);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status}`);
        }

        // Lấy content-type từ i0.wp.com response
        const contentType = imageResponse.headers.get('content-type');
        
        // Tạo response mới với đầy đủ headers
        const response = new Response(imageResponse.body, {
          headers: {
            'content-type': contentType,
            'cache-control': 'public, max-age=31536000',
            'cdn-cache-control': 'max-age=31536000',
            'vary': 'Accept', // Quan trọng để cache riêng cho WebP và non-WebP
            'content-encoding': imageResponse.headers.get('content-encoding'),
            'accept-ranges': 'bytes'
          }
        });

        // Cache response
        await cache.put(cacheKey, response.clone());
        
        return response;
      } catch (error) {
        console.error('Error:', error);
        return fetch(new Request(wpUrl, request));
      }
    }

    return new Response('Not Found', { status: 404 });
  }
};
