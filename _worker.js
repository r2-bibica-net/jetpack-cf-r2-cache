export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.hostname === 'i.bibica.net') {
      const key = url.pathname.substring(1) + url.search;
      
      try {
        // Check R2 trước
        const storedImage = await env.IMAGE_BUCKET.get(key);
        
        if (storedImage) {
          // Nếu có trong R2, trả về và cho phép cache
          return new Response(storedImage.body, {
            headers: storedImage.httpMetadata.headers
          });
        }

        // Fetch từ i0.wp.com
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

        // Set up headers - không cache khi trả về từ i0.wp.com
        const headers = new Headers(imageResponse.headers);
        headers.set('Cache-Control', 'no-store'); // Không cache response từ i0.wp.com
        headers.set('Link', `<http://bibica.net/wp-content/uploads${url.pathname}>; rel="canonical"`);

        const imageBlob = await imageResponse.blob();
        
        // Vẫn lưu vào R2
        await env.IMAGE_BUCKET.put(key, imageBlob, {
          httpMetadata: {
            headers: {
              ...Object.fromEntries(headers),
              'Cache-Control': 'public, max-age=31536000' // R2 version sẽ được cache
            }
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
