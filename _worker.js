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
          'cache-control': 'public, s-maxage=63115200',
          'content-type': 'image/webp',
          'link': imageResponse.headers.get('link'),
          'etag': imageResponse.headers.get('etag'),
          'last-modified': imageResponse.headers.get('last-modified'),
          'date': imageResponse.headers.get('date'),
          'expires': imageResponse.headers.get('expires'),
          'x-nc': imageResponse.headers.get('x-nc'),
          'X-Served-By': 'Cloudflare & Jetpack'
        }
      });
    }
    return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { status: 404 });
  }
};
