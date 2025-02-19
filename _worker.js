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
        // Cố định Accept header để giảm số lượng phiên bản được cache
        const imageResponse = await fetch(wpUrl, {
          headers: {
            'Accept': 'image/webp',
            'Accept-Encoding': 'gzip',
            'User-Agent': 'Mozilla/5.0 Chrome/120.0.0.0'
          },
        });

        if (!imageResponse.ok) {
          return new Response(`Failed to fetch image`, { status: imageResponse.status });
        }

        const imageData = await imageResponse.arrayBuffer();
        const contentType = imageResponse.headers.get('content-type');

        // Thêm metadata để tracking
        await env.IMAGE_BUCKET.put(r2Key, imageData, {
          httpMetadata: {
            contentType,
            cacheControl: 'public, max-age=315360000, immutable, no-transform',
            'X-Original-URL': wpUrl.toString(),
            'X-Cached-At': new Date().toISOString()
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

    const response = new Response(cachedImage.body, {
      headers: {
        'Content-Type': cachedImage.httpMetadata.contentType,
        'Cache-Control': 'public, max-age=315360000, immutable, no-transform',
        'CDN-Cache-Control': 'public, max-age=315360000, immutable',
        'Pragma': 'public',
        'Last-Modified': 'Mon, 01 Jan 2024 00:00:00 GMT',
        'X-Source': 'Cloudflare R2',
        'X-Cache': cachedImage ? 'HIT' : 'MISS',
        'Vary': 'Accept' // Thêm Vary header để control cache
      }
    });

    const canonicalUrl = `http://bibica.net/wp-content/uploads${url.pathname}`;
    response.headers.set('Link', `<${canonicalUrl}>; rel="canonical"`);
    
    return response;
  },
};
