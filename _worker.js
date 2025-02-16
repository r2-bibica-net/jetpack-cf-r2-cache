export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Chỉ xử lý các request đến i.bibica.net
    if (url.hostname === 'i.bibica.net') {
      const cacheKey = new Request(url.toString(), request);
      const cache = caches.default;

      // Kiểm tra xem ảnh đã được lưu trong cache chưa
      let response = await cache.match(cacheKey);

      // Nếu chưa có trong cache, lấy ảnh từ i0.wp.com và lưu vào cache
      if (!response) {
        const wpUrl = new URL(request.url);
        wpUrl.hostname = 'i0.wp.com';
        wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
        wpUrl.search = url.search;

        try {
          // Lấy ảnh từ i0.wp.com
          const imageResponse = await fetch(wpUrl, {
            headers: {
              'Accept': request.headers.get('Accept') || '*/*'
            }
          });

          if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image: ${imageResponse.status}`);
          }

          // Lưu ảnh vào cache của Cloudflare
          const headers = new Headers(imageResponse.headers);
          headers.set('Cache-Control', 'public, max-age=31536000'); // Cache trong 1 năm
          headers.set('Link', `<http://bibica.net/wp-content/uploads${url.pathname}>; rel="canonical"`);

          response = new Response(imageResponse.body, { headers });
          await cache.put(cacheKey, response.clone());
        } catch (error) {
          console.error('Error:', error);
          return new Response('Failed to fetch image', { status: 500 });
        }
      }

      // Trả về ảnh từ cache
      return response;
    }

    // Nếu không phải i.bibica.net, trả về 404
    return new Response('Not Found', { status: 404 });
  }
};
