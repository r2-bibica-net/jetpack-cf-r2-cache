export default {
  async fetch(request, env) {
    // Parse request URL
    const url = new URL(request.url);
    
    // Only process requests to i.bibica.net
    if (url.hostname !== 'i.bibica.net') {
      return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { 
        status: 404 
      });
    }

    // Check cache first
    const cache = caches.default;
    const cacheKey = new Request(request.url, request);
    let response = await cache.match(cacheKey);

    if (response) {
      // Add cache hit header
      response = new Response(response.body, response);
      response.headers.set('CF-Cache-Status', 'HIT');
      return response;
    }

    // Cache miss - process the request
    const normalizedHeaders = {
      'Accept': 'image/webp,*/*'
    };

    let targetUrl = new URL(request.url);
    let source = '';

    // Map URLs based on path
    if (url.pathname.startsWith('/avatar')) {
      targetUrl.hostname = 'secure.gravatar.com';
      targetUrl.pathname = '/avatar' + url.pathname.replace('/avatar', '');
      source = 'Gravatar';
    } else if (url.pathname.startsWith('/comment')) {
      targetUrl.hostname = 'i0.wp.com';
      targetUrl.pathname = '/comment.bibica.net/static/images' + url.pathname.replace('/comment', '');
      source = 'Artalk & Jetpack';
    } else {
      targetUrl.hostname = 'i0.wp.com';
      targetUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      targetUrl.search = url.search;
      source = 'Jetpack';
    }

    // Fetch image from source
    const sourceResponse = await fetch(targetUrl, {
      headers: normalizedHeaders
    });

    // Create cacheable response
    response = new Response(sourceResponse.body, {
      headers: {
        'content-type': 'image/webp',
        'Cache-Control': 'public, s-maxage=31536000',
        'X-Cache': sourceResponse.headers.get('x-nc'),
        'X-Served-By': `Cloudflare Pages & ${source}`,
        'CF-Cache-Status': 'MISS'
      }
    });

    // Store in cache
    await cache.put(cacheKey, response.clone());

    return response;
  }
};
