export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.hostname === 'i.bibica.net') {
      // Tạo unique key bao gồm cả query params để lưu các phiên bản khác nhau của ảnh
      const key = url.pathname.substring(1) + url.search;
      
      try {
        // Kiểm tra R2
        const storedImage = await env.MY_BUCKET.get(key);
        
        if (storedImage) {
          return new Response(storedImage.body, {
            headers: storedImage.httpMetadata.headers
          });
        }

        // Fetch từ WP với đầy đủ params
        const wpUrl = new URL(request.url);
        wpUrl.hostname = 'i0.wp.com';
        wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
        wpUrl.search = url.search;
        
        const imageResponse = await fetch(wpUrl, {
          headers: {
            'Accept': request.headers.get('Accept') || '*/*'
          }
        });

        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status}`);
        }

        // Lưu toàn bộ headers để giữ thông tin về format ảnh
        const headers = new Headers(imageResponse.headers);
        headers.set('Cache-Control', 'public, max-age=31536000');
        headers.set('Link', `<http://bibica.net/wp-content/uploads${url.pathname}>; rel="canonical"`);

        const imageBlob = await imageResponse.blob();
        
        // Lưu vào R2 với đầy đủ metadata
        await env.MY_BUCKET.put(key, imageBlob, {
          httpMetadata: {
            headers: Object.fromEntries(headers)
          }
        });

        return new Response(imageBlob, {
          headers: headers
        });

      } catch (error) {
        console.error('Error:', error);
        return new Response('Failed to process image', { status: 500 });
      }
    }

    return new Response('Not Found', { status: 404 });
  }
};
