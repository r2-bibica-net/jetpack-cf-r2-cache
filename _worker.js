export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.hostname === 'i.bibica.net') {
      // Tạo key cho file trong R2 bucket
      const key = url.pathname.substring(1); // Bỏ dấu / ở đầu
      
      try {
        // Kiểm tra xem ảnh đã có trong R2 chưa
        const storedImage = await env.MY_BUCKET.get(key);
        
        if (storedImage) {
          // Nếu có rồi thì trả về trực tiếp từ R2
          return new Response(storedImage.body, {
            headers: {
              'content-type': storedImage.httpMetadata.contentType,
              'cache-control': 'public, max-age=31536000',
              'Link': `<http://bibica.net/wp-content/uploads${url.pathname}>; rel="canonical"`
            }
          });
        }

        // Nếu chưa có thì fetch từ WordPress
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

        // Convert response sang blob để lưu vào R2
        const imageBlob = await imageResponse.blob();
        
        // Lưu vào R2 bucket
        await env.MY_BUCKET.put(key, imageBlob, {
          httpMetadata: {
            contentType: imageResponse.headers.get('content-type')
          }
        });

        // Trả về ảnh cho request hiện tại
        return new Response(imageBlob, {
          headers: {
            'content-type': imageResponse.headers.get('content-type'),
            'cache-control': 'public, max-age=31536000',
            'Link': `<http://bibica.net/wp-content/uploads${url.pathname}>; rel="canonical"`
          }
        });

      } catch (error) {
        console.error('Error:', error);
        return new Response('Failed to process image', { status: 500 });
      }
    }

    return new Response('Not Found', { status: 404 });
  }
};
