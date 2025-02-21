export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Chỉ xử lý domain i.bibica.net
    if (url.hostname !== 'i.bibica.net') {
      return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { 
        status: 404 
      });
    }

    // Cache key chỉ dựa trên URL
    const cache = caches.default;
    const cacheKey = new Request(request.url, { method: 'GET' });
    let response = await cache.match(cacheKey);

    if (response) {
      response = new Response(response.body, response);
      response.headers.set('CF-Cache-Status', 'HIT');
      return response;
    }

    // Nếu cache miss, fetch dữ liệu từ nguồn
    const normalizedHeaders = { 'Accept': 'image/webp,*/*' };
    let targetUrl = new URL(request.url);
    let source = '';

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

    const sourceResponse = await fetch(targetUrl, { headers: normalizedHeaders });

    // Tạo response cacheable
    response = new Response(sourceResponse.body, {
      headers: {
        'content-type': 'image/webp',
        'Cache-Control': 'public, s-maxage=31536000',
        'X-Cache': sourceResponse.headers.get('x-nc'),
        'X-Served-By': `Cloudflare Pages & ${source}`,
        'CF-Cache-Status': 'MISS'
      }
    });

    // Lưu vào cache
    await cache.put(cacheKey, response.clone());

    return response;
  }
};
