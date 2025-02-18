export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Chỉ cho phép yêu cầu từ 'i.bibica.net'
    if (url.hostname !== 'i.bibica.net') {
      return new Response(`Request not supported: ${url.hostname} does not match any rules.`, {
        status: 404,
        headers: {
          'Cache-Control': 'no-store'
        }
      });
    }
    const hasQueryParams = url.search !== '';
    const r2Key = url.pathname + (hasQueryParams ? url.search : '');
    
    // Nếu có query parameters, áp dụng kiểm tra referer
    if (hasQueryParams) {
      const referer = request.headers.get('Referer');
      const allowedDomains = ['bibica.net', 'static.bibica.net'];
      
      if (referer) {
        const refererUrl = new URL(referer);
        if (!allowedDomains.includes(refererUrl.hostname)) {
          return new Response(`Access denied: Requests from ${refererUrl.hostname} are not allowed.`, {
            status: 403,
            headers: {
              'Cache-Control': 'no-store'
            }
          });
        }
      } else {
        return new Response('Access denied: Referer header is missing.', {
          status: 403,
          headers: {
            'Cache-Control': 'no-store'
          }
        });
      }
    }
    // Kiểm tra cache trong R2
    let cachedImage = await env.IMAGE_BUCKET.get(r2Key);
    if (!cachedImage) {
      const wpUrl = new URL(request.url);
      wpUrl.hostname = 'i0.wp.com';
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      
      // Nếu có query params, thêm vào URL WordPress
      if (hasQueryParams) {
        wpUrl.search = url.search;
      }
      try {
        const imageResponse = await fetch(wpUrl, {
          headers: { Accept: request.headers.get('Accept') || '*/*' },
        });
        if (!imageResponse.ok) {
          return new Response(`Failed to fetch image: ${imageResponse.status}`, {
            status: imageResponse.status,
            headers: {
              'Cache-Control': 'no-store'
            }
          });
        }
        const imageData = await imageResponse.arrayBuffer();
        
        // Lưu vào R2
        await env.IMAGE_BUCKET.put(r2Key, imageData, {
          httpMetadata: {
            contentType: imageResponse.headers.get('content-type'),
            cacheControl: 'public, max-age=31536000, immutable, no-transform'
          }
        });
        cachedImage = await env.IMAGE_BUCKET.get(r2Key);
        if (!cachedImage) {
          return new Response('Failed to retrieve image from R2 after saving', {
            status: 500,
            headers: {
              'Cache-Control': 'no-store'
            }
          });
        }
      } catch (error) {
        return new Response(`Failed to fetch image: ${error.message}`, {
          status: 500,
          headers: {
            'Cache-Control': 'no-store'
          }
        });
      }
    }
    const response = new Response(cachedImage.body, {
      headers: {
        'Content-Type': cachedImage.httpMetadata.contentType,
        'Cache-Control': 'public, max-age=31536000, immutable, no-transform',
        'CDN-Cache-Control': 'public, max-age=31536000, immutable',
        'Pragma': 'public',
        'X-Source': 'Cloudflare R2 with Jetpack'
      }
    });
    const canonicalUrl = `http://bibica.net/wp-content/uploads${url.pathname}`;
    response.headers.set('Link', `<${canonicalUrl}>; rel="canonical"`);
    
    return response;
  },
};
