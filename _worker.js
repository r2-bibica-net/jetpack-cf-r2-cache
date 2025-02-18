export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname === 'i.bibica.net') {
      const wpUrl = new URL(request.url);
      wpUrl.hostname = 'i0.wp.com';
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      wpUrl.search = url.search;
      
      const wpRequest = new Request(wpUrl.toString());
      wpRequest.headers.set('Accept', 'image/webp');
      wpRequest.headers.set('Accept-Encoding', 'gzip'); // Cố định encoding

      const imageResponse = await fetch(wpRequest);

      const etagValue = `"${btoa(url.pathname + url.search)}"`;
      const responseHeaders = new Headers({
        'content-type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable, no-transform',
        'ETag': etagValue,
        'Vary': 'none'  // Override vary header
      });
      
      const contentLength = imageResponse.headers.get('content-length');
      if (contentLength) {
        responseHeaders.set('content-length', contentLength);
      }
      return new Response(imageResponse.body, {
        headers: responseHeaders
      });
    }
    return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { status: 404 });
  }
};
