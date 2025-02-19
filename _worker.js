export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Kiểm tra hostname ngay lập tức
    if (url.hostname !== 'i.bibica.net') {
      return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { status: 404 });
    }

    try {
      // Xây dựng URL mới cho tài nguyên ảnh
      const wpUrl = new URL('https://i0.wp.com/bibica.net/wp-content/uploads' + url.pathname + url.search);

      // Tạo một request mới với headers chuẩn hóa
      const standardizedHeaders = {
        'Accept': 'image/webp', // Chỉ chấp nhận định dạng WebP
      };

      // Gửi yêu cầu đến máy chủ ảnh với headers đã chuẩn hóa
      const imageResponse = await fetch(wpUrl, {
        headers: standardizedHeaders
      });

      // Kiểm tra xem phản hồi có hợp lệ không
      if (!imageResponse.ok) {
        return new Response('Failed to fetch image from upstream server.', { status: imageResponse.status });
      }

      // Trả về phản hồi với các header tối ưu hóa
      return new Response(imageResponse.body, {
        headers: {
          'cache-control': 'public, s-maxage=63115200, immutable', // Cache lâu dài
          'content-type': 'image/webp', // Định dạng WebP
          'etag': imageResponse.headers.get('etag'), // Sử dụng ETag để kiểm soát cache
          'last-modified': imageResponse.headers.get('last-modified'),
          'date': imageResponse.headers.get('date'),
          'expires': imageResponse.headers.get('expires'),
          'x-nc': imageResponse.headers.get('x-nc'),
          'Vary': 'Accept',
          'X-Served-By': 'Cloudflare & Jetpack'
        }
      });
    } catch (error) {
      // Xử lý lỗi nếu có vấn đề khi fetch
      return new Response('An error occurred while processing the request.', { status: 500 });
    }
  }
};
