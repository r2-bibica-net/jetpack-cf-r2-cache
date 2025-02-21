export default {
  async fetch(request, env) {
    // Tạo cache key chỉ dựa vào URL (bao gồm cả query string)
    const cacheKey = new Request(new URL(request.url).toString(), {
      method: 'GET',
    });

    // Truy vấn cache
    const cache = caches.default;
    let response = await cache.match(cacheKey);

    if (response) {
      // Cache hit
      response = new Response(response.body, response);
      response.headers.set('CF-Cache-Status', 'HIT');
      return response;
    }

    // Cache miss - Xử lý request
    const url = new URL(request.url);
    let targetUrl = url;
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

    // Fetch dữ liệu từ nguồn
    const sourceResponse = await fetch(targetUrl, {
      headers: {
        'Accept': 'image/webp,*/*'
      }
    });

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

    // Lưu cache với cacheKey chỉ dựa vào URL
    await cache.put(cacheKey, response.clone());

    return response;
  }
};
