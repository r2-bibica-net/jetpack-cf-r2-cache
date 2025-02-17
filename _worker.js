export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.hostname !== 'i.bibica.net') {
      return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { 
        status: 404 
      });
    }

    const r2Key = url.pathname + url.search;
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
        const imageData = await imageResponse.arrayBuffer();
        
        // Store in R2
        await env.IMAGE_BUCKET.put(r2Key, imageData, {
          httpMetadata: {
            contentType: imageResponse.headers.get('content-type'),
          }
        });
        
        cachedImage = await env.IMAGE_BUCKET.get(r2Key);
        
        if (!cachedImage) {
          console.error('Failed to retrieve image from R2 after saving');
        }
      } catch (error) {
        console.error('Error:', error);
        return new Response(`Failed to fetch image: ${error.message}`, {
          status: 500
        });
      }
    }

    // Create initial response
    const headers = new Headers({
      'content-type': cachedImage.httpMetadata.contentType,
      'vary': 'Accept',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'CDN-Cache-Control': 'public, max-age=31536000, immutable',
      'Cloudflare-CDN-Cache-Control': 'public, max-age=31536000, immutable',
      'X-Source': 'Cloudflare R2 with Jetpack'
    });

    const canonicalUrl = `http://bibica.net/wp-content/uploads${url.pathname}`;
    headers.set('Link', `<${canonicalUrl}>; rel="canonical"`);

    // Send a background fetch to the same URL to prime the cache
    fetch(request.url, {
      headers: request.headers
    }).catch(() => {}); // Ignore any errors from the background fetch

    return new Response(cachedImage.body, { headers });
  }
};
