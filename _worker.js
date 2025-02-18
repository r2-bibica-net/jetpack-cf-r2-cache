export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname === 'i.bibica.net') {
      const wpUrl = new URL(request.url);
      wpUrl.hostname = 'i0.wp.com';
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      wpUrl.search = url.search;

      const response = await fetch(wpUrl, {
        cf: {
          cacheEverything: true,
          cacheTtl: 63115200
        }
      });

      // Tạo response mới và xóa header vary
      const newHeaders = new Headers(response.headers);
      newHeaders.delete('vary');
      
      return new Response(response.body, {
        headers: newHeaders,
        status: response.status,
        statusText: response.statusText
      });
    }
    return new Response(`Request not supported: ${url.hostname} does not match any rules.`, {
      status: 404
    });
  }
};
