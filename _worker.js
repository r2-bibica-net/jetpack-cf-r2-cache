export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Chỉ xử lý các request đến i.bibica.net
    if (url.hostname === 'i.bibica.net') {
      const wpUrl = new URL(request.url);
      wpUrl.hostname = 'i0.wp.com';
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      wpUrl.search = url.search;

      // Tạo request mới với chỉ Accept header cần thiết
      const wpRequest = new Request(wpUrl.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'image/webp' // Chỉ yêu cầu hình ảnh webp
        }
      });

      try {
        const imageResponse = await fetch(wpRequest);

        // Kiểm tra nếu response không thành công
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
        }

        // Tạo ETag từ URL pathname và query string
        const etagValue = `"${btoa(url.pathname + url.search)}"`;

        // Trả về response mới với các headers được kiểm soát
        return new Response(imageResponse.body, {
          headers: {
            'content-type': 'image/webp', // Luôn trả về webp
            'Cache-Control': 'public, max-age=31536000, immutable', // Cache lâu dài
            'ETag': etagValue, // ETag để quản lý cache
            'content-length': imageResponse.headers.get('content-length') // Giữ nguyên content-length
          }
        });
      } catch (error) {
        // Xử lý lỗi nếu có
        return new Response(`Failed to fetch image: ${error.message}`, { status: 500 });
      }
    }

    // Trả về lỗi nếu hostname không khớp
    return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { status: 404 });
  }
};
