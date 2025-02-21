export default {
  async fetch(request, env) {
    const cache = caches.default;
    const cacheKey = new Request(request.url, { method: 'GET' });

    // Kiểm tra cache
    let response = await cache.match(cacheKey);
    if (response) {
      response = new Response(response.body, response);
      response.headers.set('X-Cache', 'HIT from Worker');
      return response;
    }

    // Cache MISS - Fetch từ nguồn
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

    const sourceResponse = await fetch(targetUrl, {
      headers: { 'Accept': 'image/webp,*/*' }
    });

    if (!sourceResponse.ok || sourceResponse.headers.get('Cache-Control')?.includes('no-store')) {
      return sourceResponse;
    }

    // Tạo response mới để lưu vào cache
    response = new Response(sourceResponse.body, {
      headers: {
        'Content-Type': sourceResponse.headers.get('Content-Type') || 'image/webp',
        'Cache-Control': 'public, s-maxage=31536000, max-age=31536000, immutable',
        'Vary': 'Accept-Encoding',
        'X-Cache': 'MISS from Worker',
        'X-Served-By': `Cloudflare Pages & ${source}`
      }
    });

    // Lưu cache
    await cache.put(cacheKey, response.clone());

    return response;
  }
};
