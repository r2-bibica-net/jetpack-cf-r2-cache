export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.hostname !== 'i.bibica.net') {
      return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { 
        status: 404 
      });
    }

    const r2Key = url.pathname + url.search;
    console.log('Checking R2 for key:', r2Key);
    
    // Try to get image from R2 first
    let cachedImage = await env.IMAGE_BUCKET.get(r2Key);
    console.log('R2 cache check result:', cachedImage ? 'Found in cache' : 'Not in cache');
    
    if (!cachedImage) {
      console.log('Cache miss - fetching from WordPress');
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
        console.log('Got image from WordPress, size:', imageData.byteLength);
        
        // Store in R2
        console.log('Storing in R2...');
        await env.IMAGE_BUCKET.put(r2Key, imageData, {
          httpMetadata: {
            contentType: imageResponse.headers.get('content-type'),
          }
        });
        
        // Get the newly stored image from R2
        console.log('Retrieving stored image from R2');
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
    } else {
      console.log('Cache hit - serving from R2');
    }

    // Add debug headers
    const headers = {
      'content-type': cachedImage.httpMetadata.contentType,
      'vary': 'Accept',
      'Cache-Control': 'public, max-age=31536000',
      'CDN-Cache-Control': 'public, max-age=31536000',
      'Cloudflare-CDN-Cache-Control': 'public, max-age=31536000',
      'X-Source': 'Cloudflare R2 with Jetpack',
      'X-Cache-Debug': cachedImage ? 'R2-HIT' : 'R2-MISS',
      'X-R2-Key': r2Key
    };

    // Always return from R2
    const response = new Response(cachedImage.body, { headers });

    // Add canonical URL header
    const canonicalUrl = `http://bibica.net/wp-content/uploads${url.pathname}`;
    response.headers.set('Link', `<${canonicalUrl}>; rel="canonical"`);
    
    return response;
  }
};
