export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname === 'i.bibica.net') {
      // Create a new normalized request
      const normalizedRequest = new Request(request.url, {
        method: 'GET',
        // Don't forward any headers from the original request
        headers: {}
      });

      const wpUrl = new URL(normalizedRequest.url);
      wpUrl.hostname = 'i0.wp.com';
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      wpUrl.search = url.search;

      // Use minimal headers for wp.com request
      const wpRequest = new Request(wpUrl.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'image/webp'
        }
      });

      const imageResponse = await fetch(wpRequest);
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
