export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Kiểm tra hostname
    if (url.hostname === 'i.bibica.net') {
      const wpUrl = new URL(request.url);
      wpUrl.hostname = 'i0.wp.com';
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      wpUrl.search = url.search;

      // Fetch từ i0.wp.com
      const imageResponse = await fetch(wpUrl, {
        headers: {
          'Accept': request.headers.get('Accept') || '*/*',
        },
      });

      // Lấy headers từ response của i0.wp.com
      const headers = new Headers();
      for (const [key, value] of imageResponse.headers.entries()) {
        // Chuyển tiếp các headers quan trọng
        if (
          key.toLowerCase() === 'cache-control' ||
          key.toLowerCase() === 'expires' ||
          key.toLowerCase() === 'etag' ||
          key.toLowerCase() === 'content-type'
        ) {
          headers.set(key, value);
        }
      }

      // Trả về response với headers đã chuyển tiếp
      return new Response(imageResponse.body, {
        status: imageResponse.status,
        headers: headers,
      });
    }

    // Nếu hostname không khớp, trả về lỗi 404
    return new Response(`Request not supported: ${url.hostname} does not match any rules.`, {
      status: 404,
    });
  },
};
