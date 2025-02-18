export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);
  if (url.hostname === 'i.bibica.net') {
    try {
      // Thử lấy ảnh từ Pages
      const response = await next();
      if (response.ok) {
        return response;
      }
    } catch (error) {
      // Tiếp tục nếu ảnh chưa có
    }

    // Fetch từ Jetpack và cache
    const wpUrl = new URL(request.url);
    wpUrl.hostname = 'i0.wp.com';
    wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
    wpUrl.search = url.search;

    const wpRequest = new Request(wpUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'image/webp'
      }
    });

    const imageResponse = await fetch(wpRequest);
    if (!imageResponse.ok) {
      return new Response('Image not found', { status: 404 });
    }

    // Return response với cache headers
    return new Response(imageResponse.body, {
      headers: {
        'content-type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000'
      }
    });
  }

  return new Response('Not found', { status: 404 });
}
