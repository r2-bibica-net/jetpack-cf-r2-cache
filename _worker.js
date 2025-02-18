export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Kiểm tra nếu hostname là 'i.bibica.net'
    if (url.hostname === 'i.bibica.net') {
      const wpUrl = new URL(request.url);

      // Thay đổi hostname thành 'i0.wp.com'
      wpUrl.hostname = 'i0.wp.com';

      // Thay đổi pathname để trỏ đến thư mục uploads trên WordPress
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;

      // Giữ nguyên query string (nếu có)
      wpUrl.search = url.search;

      // Gửi yêu cầu đến server mới (i0.wp.com)
      const imageResponse = await fetch(wpUrl, {
        headers: {
          'Accept': request.headers.get('Accept') || '/',
          'If-None-Match': request.headers.get('If-None-Match') || '', // Chuyển tiếp ETag nếu có
          'If-Modified-Since': request.headers.get('If-Modified-Since') || '' // Chuyển tiếp Last-Modified nếu có
        }
      });

      // Nếu phản hồi là 304 Not Modified, trả về phản hồi tương ứng
      if (imageResponse.status === 304) {
        return new Response(null, {
          status: 304,
          headers: {
            'Cache-Control': 'public, max-age=63115200', // Cache trong 2 năm
            'Expires': 'Tue, 16 Feb 2027 22:35:06 GMT',
            'ETag': imageResponse.headers.get('ETag') || '',
            'Last-Modified': imageResponse.headers.get('Last-Modified') || ''
          }
        });
      }

      // Trả về phản hồi từ server mới với các headers cache phù hợp
      return new Response(imageResponse.body, {
        headers: {
          'Content-Type': imageResponse.headers.get('Content-Type') || 'image/png',
          'Cache-Control': 'public, max-age=63115200', // Cache trong 2 năm
          'Expires': 'Tue, 16 Feb 2027 22:35:06 GMT',
          'ETag': imageResponse.headers.get('ETag') || '',
          'Last-Modified': imageResponse.headers.get('Last-Modified') || '',
          'Vary': 'Accept' // Giữ nguyên header Vary
        }
      });
    }

    // Nếu hostname không phải 'i.bibica.net', trả về lỗi 404
    return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { status: 404 });
  }
};
