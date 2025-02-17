export default {
  async fetch(request, env) {
    try {
      // Check if R2 binding exists
      if (!env?.IMAGE_BUCKET) {
        throw new Error('R2 bucket binding not found. Please check IMAGE_BUCKET configuration.');
      }

      const url = new URL(request.url);
      
      if (url.hostname !== 'i.bibica.net') {
        return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { 
          status: 404 
        });
      }

      const r2Key = url.pathname + url.search;
      
      try {
        // Try to get image from R2 first
        let cachedImage = await env.IMAGE_BUCKET.get(r2Key);
        
        if (!cachedImage) {
          console.log('Cache miss, fetching from WordPress:', r2Key);
          
          // Image not in R2, fetch from WordPress and save to R2
          const wpUrl = new URL(request.url);
          wpUrl.hostname = 'i0.wp.com';
          wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
          
          const imageResponse = await fetch(wpUrl, {
            headers: { 'Accept': request.headers.get('Accept') || '*/*' }
          });

          if (!imageResponse.ok) {
            throw new Error(`WordPress image fetch failed: ${imageResponse.status} ${imageResponse.statusText}`);
          }

          // Get the image data
          const imageData = await imageResponse.arrayBuffer();
          const contentType = imageResponse.headers.get('content-type');
          
          if (!contentType) {
            throw new Error('No content-type received from WordPress');
          }
          
          // Store in R2
          await env.IMAGE_BUCKET.put(r2Key, imageData, {
            httpMetadata: {
              contentType: contentType,
            }
          });
          
          // Get the newly stored image from R2
          cachedImage = await env.IMAGE_BUCKET.get(r2Key);
          
          if (!cachedImage) {
            throw new Error('Failed to retrieve image from R2 after saving');
          }
        }

        const response = new Response(cachedImage.body, {
          headers: {
            'content-type': cachedImage.httpMetadata.contentType,
            'vary': 'Accept',
            'Cache-Control': 'public, max-age=31536000',
            'CDN-Cache-Control': 'public, max-age=31536000',
            'Cloudflare-CDN-Cache-Control': 'public, max-age=31536000',
            'X-Source': 'r2-cache',
          }
        });

        const canonicalUrl = `http://bibica.net/wp-content/uploads${url.pathname}`;
        response.headers.set('Link', `<${canonicalUrl}>; rel="canonical"`);
        
        return response;

      } catch (error) {
        console.error('Error processing image:', error);
        return new Response(`Error processing image: ${error.message}`, {
          status: 500,
          headers: {
            'Content-Type': 'text/plain',
          }
        });
      }
      
    } catch (error) {
      console.error('Critical error:', error);
      return new Response(`Critical error: ${error.message}`, {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
        }
      });
    }
  }
};
