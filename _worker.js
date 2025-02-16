export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.hostname === 'i.bibica.net') {
      const key = url.pathname.substring(1) + url.search;
      
      try {
        // Kiểm tra R2
        const storedImage = await env.IMAGE_BUCKET.get(key);
        
        if (storedImage) {
          // Cache chỉ khi serve từ R2
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

        // Set headers với no-store cho response từ i0.wp.com
        const headers = new Headers(imageResponse.headers);
        headers.set('Cache-Control', 'no-store');
        
        const imageBlob = await imageResponse.blob();
        
        // Lưu vào R2 với cache-control
        await env.IMAGE_BUCKET.put(key, imageBlob, {
          httpMetadata: {
            headers: {
              ...Object.fromEntries(headers),
              'Cache-Control': 'public, max-age=31536000' // Cache khi serve từ R2
            }
          }
        });

        return new Response(imageBlob, {
          headers: headers  // no-store cho response từ i0.wp.com
        });

      } catch (error) {
        console.error('Error:', error);
        return new Response('Failed to process image', { status: 500 });
      }
    }

    return new Response('Not Found', { status: 404 });
  }
};
