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
          'content-type': 'image/webp',
          'link': imageResponse.headers.get('link'),
          'X-Cache': imageResponse.headers.get('x-nc'),
          'X-Served-By': 'Cloudflare Pages & Jetpack'
        }
      });
    }
    return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { status: 404 });
  }
};
