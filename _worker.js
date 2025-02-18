export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname === 'i.bibica.net') {
      // Chuẩn hóa cache key bằng cách chỉ sử dụng pathname và search
      const cacheKey = url.pathname + url.search;
      
      // Tạo request mới đến WordPress
      const wpUrl = new URL(request.url);
      wpUrl.hostname = 'i0.wp.com';
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      wpUrl.search = url.search;

      // Kiểm tra If-None-Match header
      const ifNoneMatch = request.headers.get('If-None-Match');
      const etagValue = `"${btoa(cacheKey)}"`;
      
      if (ifNoneMatch === etagValue) {
        return new Response(null, {
          status: 304,
          headers: {
            'Cache-Control': 'public, max-age=31536000, immutable',
            'ETag': etagValue
          }
        });
      }

      // Thực hiện request với các headers cố định
      const wpRequest = new Request(wpUrl.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'image/webp',
          'Cache-Control': 'no-cache'  // Đảm bảo luôn nhận được response mới từ wp.com
        }
      });
      
      const imageResponse = await fetch(wpRequest);
      
      // Tạo response headers với các giá trị cố định
      const responseHeaders = new Headers({
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'ETag': etagValue,
        'Vary': 'Accept'  // Chỉ vary theo Accept header
      });

      // Copy content-length nếu có
      const contentLength = imageResponse.headers.get('content-length');
      if (contentLength) {
        responseHeaders.set('Content-Length', contentLength);
      }

      return new Response(imageResponse.body, {
        status: imageResponse.status,
        headers: responseHeaders
      });
    }

    return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { 
      status: 404,
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  }
};
