export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    if (url.hostname === 'i.bibica.net') {
      const wpUrl = new URL(request.url);
      wpUrl.hostname = 'i0.wp.com';
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      wpUrl.search = url.search;
      
      // Forward các header quan trọng từ request gốc
      const headers = new Headers({
        'Accept': request.headers.get('Accept') || '*/*',
        'If-None-Match': request.headers.get('If-None-Match'),
        'If-Modified-Since': request.headers.get('If-Modified-Since')
      });

      const imageResponse = await fetch(wpUrl, {
        headers: headers
      });

      // Copy tất cả headers từ response gốc
      const responseHeaders = new Headers(imageResponse.headers);
      
      return new Response(imageResponse.body, {
        status: imageResponse.status,
        statusText: imageResponse.statusText,
        headers: responseHeaders
      });
    }
    
    return new Response(`Request not supported: ${url.hostname} does not match any rules.`, {
      status: 404
    });
  }
};
