export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.hostname === 'i.bibica.net') {
      const wpUrl = new URL(request.url);
      wpUrl.hostname = 'i0.wp.com';
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      wpUrl.search = url.search;

      const imageResponse = await fetch(wpUrl, {
        headers: { 'Accept': request.headers.get('Accept') || '*/*' }
      });
      const canonicalUrl = `http://bibica.net/wp-content/uploads${url.pathname}`;

      return new Response(imageResponse.body, {
        headers: {
          'content-type': imageResponse.headers.get('content-type'),
          'Link': `<${canonicalUrl}>; rel="canonical"`,
          'Cache-Control': 'public, max-age=31536000, immutable, no-transform',
          'Pragma': 'public',
          'Last-Modified': 'Mon, 01 Jan 2024 00:00:00 GMT',          
          'X-Served-By': 'Cloudflare & Jetpack'
        }
      });
    }
    return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { status: 404 });
  }
};
