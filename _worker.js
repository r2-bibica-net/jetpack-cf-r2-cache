export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.hostname === 'i.bibica.net') {
      const wpUrl = new URL(request.url);
      wpUrl.hostname = 'i0.wp.com';
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      wpUrl.search = url.search;

      const imageResponse = await fetch(wpUrl, {
        headers: { 'Accept': 'image/webp' }
      });

      return new Response(imageResponse.body, {
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable, no-transform',
          'content-type': imageResponse.headers.get('content-type'),
          'content-type': 'image/webp',
          'link': imageResponse.headers.get('link'),
          'x-nc': imageResponse.headers.get('x-nc'),
          'X-Served-By': 'Cloudflare & Jetpack'
        }
      });
    }
    return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { status: 404 });
  }
};
