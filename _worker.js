export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.hostname !== 'i.bibica.net') {
      return new Response(`Request not supported`, { status: 404 });
    }

    const hasQueryParams = url.search !== '';
    const r2Key = url.pathname + (hasQueryParams ? url.search : '');
    
    if (hasQueryParams) {
      const referer = request.headers.get('Referer');
      const allowedDomains = ['bibica.net', 'static.bibica.net'];
      
      if (referer) {
        const refererUrl = new URL(referer);
        if (!allowedDomains.includes(refererUrl.hostname)) {
          return new Response(`Access denied`, { status: 403 });
        }
      } else {
        return new Response('Access denied', { status: 403 });
      }
    }

    let cachedImage = await env.IMAGE_BUCKET.get(r2Key);
    if (!cachedImage) {
      const wpUrl = new URL(request.url);
      wpUrl.hostname = 'i0.wp.com';
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      
      if (hasQueryParams) {
        wpUrl.search = url.search;
      }

      try {
        // Để nguyên request headers khi fetch từ Jetpack
        const imageResponse = await fetch(wpUrl);

        if (!imageResponse.ok) {
          return new Response(`Failed to fetch image`, { status: imageResponse.status });
        }

        const imageData = await imageResponse.arrayBuffer();
        
        // Lưu vào R2 với content-type từ Jetpack
        await env.IMAGE_BUCKET.put(r2Key, imageData, {
          httpMetadata: {
            contentType: imageResponse.headers.get('content-type')
          }
        });

        cachedImage = await env.IMAGE_BUCKET.get(r2Key);
        if (!cachedImage) {
          return new Response('Failed to cache image', { status: 500 });
        }
      } catch (error) {
        return new Response(`Failed to fetch image: ${error.message}`, { status: 500 });
      }
    }

    // Trả về response với minimal headers
    const response = new Response(cachedImage.body, {
      headers: {
        'Content-Type': cachedImage.httpMetadata.contentType,
        'X-Source': 'Cloudflare R2 & Jetpack',
        'X-Cache': cachedImage ? 'HIT' : 'MISS'
      }
    });

    const canonicalUrl = `http://bibica.net/wp-content/uploads${url.pathname}`;
    response.headers.set('Link', `<${canonicalUrl}>; rel="canonical"`);
    
    return response;
  },
};
