export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname === 'i.bibica.net') {
      // Log tất cả request headers để debug
      console.log('Request headers:');
      for (const [key, value] of request.headers.entries()) {
        console.log(`${key}: ${value}`);
      }

      const wpUrl = new URL(request.url);
      wpUrl.hostname = 'i0.wp.com';
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      wpUrl.search = url.search;

      const imageResponse = await fetch(wpUrl, {
        headers: { 'Accept': request.headers.get('Accept') || '*/*' }
      });

      // Log response headers từ wp.com
      console.log('WP.com response headers:');
      for (const [key, value] of imageResponse.headers.entries()) {
        console.log(`${key}: ${value}`);
      }

      const canonicalUrl = `http://bibica.net/wp-content/uploads${url.pathname}`;
      return new Response(imageResponse.body, {
        headers: {
          'content-type': imageResponse.headers.get('content-type'),
          'Cache-Control': 'public, max-age=31536000, immutable, no-transform',
          'Link': `<${canonicalUrl}>; rel="canonical"`,
          'X-Served-By': 'Cloudflare & Jetpack'
        }
      });
    }
    return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { status: 404 });
  }
};
