export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.hostname !== 'i.bibica.net') {
      return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { 
        status: 404 
      });
    }

    const r2Key = url.pathname + url.search;
    
    // Try to get image from R2 first
    let cachedImage = await env.IMAGE_BUCKET.get(r2Key);
    
    if (!cachedImage) {
      // Image not in R2, fetch from WordPress and save to R2
      const wpUrl = new URL(request.url);
      wpUrl.hostname = 'i0.wp.com';
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      
      try {
        const imageResponse = await fetch(wpUrl, {
          headers: { 'Accept': request.headers.get('Accept') || '*/*' }
        });

        if (!imageResponse.ok) {
          throw new Error(`WordPress image fetch failed: ${imageResponse.status}`);
        }

        // Get the image data as an array buffer
        const imageData = await imageResponse.arrayBuffer();
        
        // Store in R2 with cache headers
        await env.IMAGE_BUCKET.put(r2Key, imageData, {
          httpMetadata: {
            contentType: imageResponse.headers.get('content-type'),
          },
          cacheControl: 'public, max-age=31536000, immutable'
        });
        
        // Get the newly stored image from R2
        cachedImage = await env.IMAGE_BUCKET.get(r2Key);
        
        if (!cachedImage) {
          throw new Error('Failed to retrieve image from R2 after saving');
        }
      } catch (error) {
        return new Response(`Failed to fetch image: ${error.message}`, {
          status: 500
        });
      }
    }

    // Add cache headers
    const headers = {
      'content-type': cachedImage.httpMetadata.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Source': 'Cloudflare R2 with Jetpack'
    };

    // Always return from R2
    const response = new Response(cachedImage.body, { headers });

    // Add canonical URL header
    const canonicalUrl = `http://bibica.net/wp-content/uploads${url.pathname}`;
    response.headers.set('Link', `<${canonicalUrl}>; rel="canonical"`);
    
    return response;
  }
};
