export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname === 'i.bibica.net') {
      const wpUrl = new URL(request.url);
      wpUrl.hostname = 'i0.wp.com';
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      wpUrl.search = url.search;

      // Tạo cache key cố định
      const customCacheKey = new Request(url.pathname + url.search, {
        method: 'GET'
      });
      
      const wpRequest = new Request(wpUrl.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'image/webp'
        }
      });

      // Sử dụng cacheKey tùy chỉnh thay vì request gốc
      const response = await fetch(wpRequest, {
        cf: {
          // Cache dựa trên customCacheKey thay vì request
          cacheKey: customCacheKey
        }
      });

      return response;
    }
    return new Response(`Request not supported`, { status: 404 });
  }
};
