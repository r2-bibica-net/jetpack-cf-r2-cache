export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.hostname === 'i.bibica.net') {
      const acceptHeader = request.headers.get('Accept') || '';
      const supportsWebP = acceptHeader.includes('image/webp');
      
      const imageKey = supportsWebP ? `webp${url.pathname}` : `original${url.pathname}`;
      const canonicalUrl = `http://bibica.net/wp-content/uploads${url.pathname}`;

      try {
        // Kiểm tra ảnh trong R2
        const r2Object = await env.IMAGE_BUCKET.get(imageKey);
        
        if (r2Object) {
          return new Response(r2Object.body, {
            headers: {
              'content-type': r2Object.httpMetadata.contentType,
              'vary': 'Accept',
              'etag': r2Object.httpEtag,
              'Cache-Control': 'public, max-age=31536000, immutable',
              'Link': `<${canonicalUrl}>; rel="canonical"`
            }
          });
        }

        // Fetch từ i0.wp.com
        const wpUrl = new URL(request.url);
        wpUrl.hostname = 'i0.wp.com';
        wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
        wpUrl.search = url.search;

        const imageResponse = await fetch(wpUrl, {
          headers: {
            'Accept': supportsWebP ? 'image/webp,*/*' : '*/*'
          }
        });
        
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status}`);
        }

        // Lưu vào R2
        await env.IMAGE_BUCKET.put(imageKey, imageResponse.body, {
          httpMetadata: {
            contentType: imageResponse.headers.get('content-type')
          }
        });
        
        return new Response(imageResponse.body, {
          headers: {
            'content-type': imageResponse.headers.get('content-type'),
            'vary': 'Accept',
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Link': `<${canonicalUrl}>; rel="canonical"`
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
