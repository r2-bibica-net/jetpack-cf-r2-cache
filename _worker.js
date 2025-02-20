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

      return new Response(imageResponse.body, {
        headers: {
          'Cache-Control': imageResponse.headers.get('Cache-Control'),
          'content-type': 'image/webp',
          'vary': 'Accept',
          'link': imageResponse.headers.get('link'),
          'X-Served-By': 'Cloudflare & Jetpack'
          'last-modified': imageResponse.headers.get('last-modified'),
          'cf-cache-status': imageResponse.headers.get('cf-cache-status') || 'DYNAMIC',
          'X-Cache': imageResponse.headers.get('x-nc'),
          'X-Served-By': 'Cloudflare Pages & Jetpack'
        }
      });
    }
    return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { status: 404 });
  }
};
