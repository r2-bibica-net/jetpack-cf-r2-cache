export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.hostname === 'i.bibica.net') {
      const r2Key = url.pathname.substring(1);

      try {
        // Kiểm tra ảnh trong R2
        const r2Object = await env.IMAGES.get(r2Key);
        
        if (r2Object) {
          // Trả về với content-type gốc đã lưu
          return new Response(r2Object.body, {
            headers: {
              'content-type': r2Object.httpMetadata.contentType,  // Không cần fallback
              'vary': 'Accept',
              'etag': r2Object.httpEtag
            }
          });
        }

        // Fetch từ i0.wp.com với Accept header
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

        const contentType = imageResponse.headers.get('content-type');
        const imageBody = await imageResponse.arrayBuffer();
        
        // Lưu vào R2 với content-type gốc
        await env.IMAGES.put(r2Key, imageBody, {
          httpMetadata: {
            contentType: contentType  // Lưu đúng content-type (có thể là image/webp)
          }
        });
        
        return new Response(imageBody, {
          headers: {
            'content-type': contentType,
            'vary': 'Accept'
          }
        });

      } catch (error) {
        console.error('Error:', error);
        const wpUrl = new URL('https://i0.wp.com/bibica.net/wp-content/uploads' + url.pathname + url.search);
        return fetch(new Request(wpUrl, request));
      }
    }

    return new Response('Not Found', { status: 404 });
  }
};
