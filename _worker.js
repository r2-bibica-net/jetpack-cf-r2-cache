export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const cache = caches.default;
    
    // Rules config giữ nguyên
    const rules = {
      '/avatar': {
        targetHost: 'secure.gravatar.com',
        pathTransform: (path, prefix) => '/avatar' + path.replace(prefix, ''),
        service: 'Gravatar'
      },
      '/comment': {
        targetHost: 'i0.wp.com',
        pathTransform: (path, prefix) => '/comment.bibica.net/static/images' + path.replace(prefix, ''),
        service: 'Artalk & Jetpack'
      },
      '/': {
        targetHost: 'i0.wp.com',
        pathTransform: (path) => '/bibica.net/wp-content/uploads' + path,
        service: 'Jetpack'
      }
    };

    try {
      // Tìm rule phù hợp
      const rule = Object.entries(rules).find(([prefix]) => url.pathname.startsWith(prefix));
      
      if (!rule) {
        return new Response(`Path not supported: ${url.pathname}`, { 
          status: 404,
          headers: {
            'Cache-Control': 'public, max-age=60'
          }
        });
      }

      // Tạo target URL
      const [prefix, config] = rule;
      const targetUrl = new URL(request.url);
      targetUrl.hostname = config.targetHost;
      targetUrl.pathname = config.pathTransform(url.pathname, prefix);
      targetUrl.search = url.search;

      // Tạo cache key từ target URL
      const cacheKey = new Request(targetUrl.toString(), {
        method: 'GET',
        headers: request.headers
      });

      // Kiểm tra cache
      let response = await cache.match(cacheKey);
      
      if (response) {
        response = new Response(response.body, response);
        response.headers.set('CF-Cache-Status', 'HIT');
        return response;
      }

      // Fetch từ origin nếu không có trong cache
      response = await fetch(targetUrl, {
        headers: { 'Accept': request.headers.get('Accept') || '*/*' }
      });

      if (!response.ok) {
        throw new Error(`Origin responded with ${response.status}`);
      }

      // Tạo response mới với custom headers
      const newResponse = new Response(response.body, {
        headers: {
          'Content-Type': response.headers.get('content-type') || 'image/webp',
          'Cache-Control': 'public, max-age=31536000',
          'ETag': response.headers.get('etag'),
          'Last-Modified': response.headers.get('last-modified'),
          'CF-Cache-Status': 'MISS',
          'X-Served-By': `Cloudflare Pages & ${config.service}`
        }
      });

      // Cache response
      ctx.waitUntil(cache.put(cacheKey, newResponse.clone()));

      return newResponse;
    } catch (error) {
      console.error('Error:', error);
      return new Response('Internal Server Error', { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store'
        }
      });
    }
  }
};
