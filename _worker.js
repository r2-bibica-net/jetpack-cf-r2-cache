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
          'x-nc': imageResponse.headers.get('x-nc'),
          'X-Served-By': 'Cloudflare & Jetpack'
        }
      });
    }
    return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { status: 404 });
  }
};
