export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Chỉ xử lý các request đến i.bibica.net
    if (url.hostname === 'i.bibica.net') {
      const imageKey = url.pathname; // Ví dụ: /example.jpg

      // Kiểm tra xem ảnh đã tồn tại trong R2 chưa
      let object = await env.IMAGE_BUCKET.get(imageKey);

      // Nếu ảnh chưa tồn tại, lấy từ i0.wp.com và lưu vào R2
      if (!object) {
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

          // Lưu ảnh vào R2
          await env.IMAGE_BUCKET.put(imageKey, imageResponse.body, {
            httpMetadata: {
              contentType: imageResponse.headers.get('content-type')
            }
          });

          // Lấy lại ảnh từ R2
          object = await env.IMAGE_BUCKET.get(imageKey);
        } catch (error) {
          console.error('Error:', error);
          return new Response('Failed to fetch image', { status: 500 });
        }
      }

      // Trả về ảnh từ R2
      return new Response(object.body, {
        headers: {
          'content-type': object.httpMetadata.contentType,
          'Cache-Control': 'public, max-age=31536000' // Cache trong 1 năm
        }
      });
    }

    // Nếu không phải i.bibica.net, trả về 404
    return new Response('Not Found', { status: 404 });
  }
};
