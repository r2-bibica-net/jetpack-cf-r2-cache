export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname === 'i.bibica.net') {
      const wpUrl = new URL(request.url);
      wpUrl.hostname = 'i0.wp.com';
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      wpUrl.search = url.search;

      // Chỉ định rõ Accept: image/webp
      const headers = new Headers();
      headers.set('Accept', 'image/webp');
      
      const imageResponse = await fetch(wpUrl, { headers });
      const canonicalUrl = `http://bibica.net/wp-content/uploads${url.pathname}`;

      return new Response(imageResponse.body, {
        headers: {
          'content-type': 'image/webp',
          'Cache-Control': 'public, max-age=31536000, immutable, no-transform',
          'Link': `<${canonicalUrl}>; rel="canonical"`,
          'X-Served-By': 'Cloudflare & Jetpack'
        }
      });
    }
    return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { status: 404 });
  }
};
