export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Chỉ xử lý các request đến i.bibica.net
    if (url.hostname === 'i.bibica.net') {
      const imageKey = url.pathname + url.search; // Ví dụ: /2024/07/example.jpg?w=1024

      // Kiểm tra xem ảnh đã tồn tại trong R2 chưa
      let object = await env.IMAGE_BUCKET.get(imageKey);

      // Nếu ảnh đã tồn tại trong R2, trả về ảnh từ R2
      if (object) {
        return new Response(object.body, {
          headers: {
            'content-type': object.httpMetadata.contentType, // Giữ nguyên content-type
            'Cache-Control': 'public, max-age=31536000' // Cache trong 1 năm
          }
        });
      }

      // Nếu ảnh chưa tồn tại trong R2, lấy từ i0.wp.com và lưu vào R2
      const wpUrl = new URL(request.url);
      wpUrl.hostname = 'i0.wp.com';
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      wpUrl.search = url.search;

      try {
        // Bypass cache của Cloudflare CDN bằng cách thêm header Cache-Control: no-cache
        const imageResponse = await fetch(wpUrl, {
          headers: {
            'Accept': request.headers.get('Accept') || '*/*',
            'Cache-Control': 'no-cache' // Bypass cache của Cloudflare CDN
          }
        });

        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status}`);
        }

        // Lưu ảnh vào R2
        await env.IMAGE_BUCKET.put(imageKey, imageResponse.body, {
          httpMetadata: {
            contentType: imageResponse.headers.get('content-type') // Lưu content-type
          }
        });

        // Trả về ảnh từ i0.wp.com (lần đầu tiên)
        return new Response(imageResponse.body, {
          headers: {
            'content-type': imageResponse.headers.get('content-type'),
            'Cache-Control': 'public, max-age=31536000' // Cache trong 1 năm
          }
        });
      } catch (error) {
        console.error('Error:', error);
        return new Response('Failed to fetch image', { status: 500 });
      }
    }

    // Nếu không phải i.bibica.net, trả về 404
    return new Response('Not Found', { status: 404 });
  }
};
