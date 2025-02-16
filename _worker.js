export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.hostname === 'i.bibica.net') {
      const wpUrl = new URL(request.url);
      wpUrl.hostname = 'i0.wp.com';
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      wpUrl.search = url.search;

      const response = await fetch(new Request(wpUrl, request));
      const canonicalUrl = `http://bibica.net/wp-content/uploads/${url.pathname}`;

      // Tạo response mới với headers tùy chỉnh
      return new Response(response.body, {
        headers: {
          'content-type': response.headers.get('content-type'),
          'vary': 'Accept',
          'Link': `<${canonicalUrl}>; rel="canonical"`
        }
      });
    }

    return new Response('Not Found', { status: 404 });
  }
};
