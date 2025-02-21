export default {
  async fetch(request, env) {
    const cache = caches.default;
    const cacheKey = new Request(new URL(request.url).toString(), { method: 'GET' });

    // Kiểm tra cache
    let response = await cache.match(cacheKey);
    if (response) {
      return response;
    }

    // Xác định nguồn ảnh
    const url = new URL(request.url);
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

    // Fetch từ nguồn
    const sourceResponse = await fetch(targetUrl, {
      headers: { 'Accept': 'image/webp,*/*' }
    });

    // Nếu response lỗi, trả về luôn
    if (!sourceResponse.ok) {
      return new Response(`Error fetching from ${source}`, {
        status: sourceResponse.status,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Tạo response với headers cần thiết
    response = new Response(sourceResponse.body, {
      headers: {
        'Content-Type': sourceResponse.headers.get('Content-Type') || 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Vary': 'Accept-Encoding',
        'X-Served-By': `Cloudflare Pages & ${source}`
      }
    });

    // Lưu vào cache
    await cache.put(cacheKey, response.clone());

    return response;
  }
};
