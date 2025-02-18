export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname === 'i.bibica.net') {
      const wpUrl = new URL(request.url);
      wpUrl.hostname = 'i0.wp.com';
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      wpUrl.search = url.search;

      // Tạo request mới với headers tối thiểu
      const newRequest = new Request(wpUrl, {
        method: 'GET',
        headers: {
          'Accept': 'image/*'
        }
      });

      return fetch(newRequest, {
        cf: {
          cacheEverything: true,
          cacheTtl: 63115200
        }
      });
    }
    return new Response(`Request not supported: ${url.hostname} does not match any rules.`, {
      status: 404
    });
  }
};
