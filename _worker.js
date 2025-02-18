export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname === 'i.bibica.net') {
      const wpUrl = new URL(request.url);
      wpUrl.hostname = 'i0.wp.com';
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      wpUrl.search = url.search;
      const imageResponse = await fetch(wpUrl); // Loại bỏ headers không cần thiết
      return new Response(imageResponse.body, {
        headers: {
          'link': imageResponse.headers.get('link'),
          'last-modified': imageResponse.headers.get('last-modified'),
          'expires': imageResponse.headers.get('expires'),
          'Cache-Control': 'public, max-age=31536000, immutable, no-transform',
          'Pragma': 'public',
          'X-Served-By': 'Cloudflare & Jetpack'
        }
      });
    }
    return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { status: 404 });
  }
};
