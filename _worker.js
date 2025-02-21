export default {
  async fetch(request, env) {
    // Tạo cache key dựa trên URL (không xét headers)
    const cacheKey = new Request(new URL(request.url).toString(), { method: 'GET' });

    // Truy vấn cache Cloudflare
    const cache = caches.default;
    let response = await cache.match(cacheKey);

    if (response) {
      return new Response(response.body, response);
    }

    // Xác định nguồn dữ liệu
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
      headers: { 'Accept': 'image/webp,*/*' }
    });

    // Nếu phản hồi không hợp lệ, trả về ngay
    if (!sourceResponse.ok) {
      return sourceResponse;
    }

    // Sao chép headers gốc, đảm bảo có Content-Type
    let headers = new Headers(sourceResponse.headers);
    headers.set('Cache-Control', 'public, s-maxage=31536000, max-age=31536000, immutable');
    headers.set('Vary', 'Accept-Encoding');
    headers.set('X-Served-By', `Cloudflare Pages & ${source}`);

    response = new Response(sourceResponse.body, { headers });

    // Lưu cache
    await cache.put(cacheKey, response.clone());

    return response;
  }
};
