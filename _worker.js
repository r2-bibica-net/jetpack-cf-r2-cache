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
          'cache-control': imageResponse.headers.get('cache-control'),
          'expires': imageResponse.headers.get('expires'),
          'last-modified': imageResponse.headers.get('last-modified'),
          'link': imageResponse.headers.get('link'),
          'etag': imageResponse.headers.get('etag'),
          'x-nc': imageResponse.headers.get('x-nc'),
          'X-Served-By': 'Cloudflare & Jetpack'
        }
      });
    }
    return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { status: 404 });
  }
};
