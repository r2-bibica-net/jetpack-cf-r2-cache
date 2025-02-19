export default {
  async fetch(request) {
    // Tối ưu việc tạo URL object bằng cách chỉ tạo một lần
    const url = new URL(request.url);
    
    // Kiểm tra hostname sớm để tránh xử lý không cần thiết
    if (url.hostname !== 'i.bibica.net') {
      return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { 
        status: 404,
        headers: {
          'content-type': 'text/plain',
          'cache-control': 'no-store'
        }
      });
    }

    // Tạo wpUrl với các thông số được định nghĩa trước
    const wpUrl = new URL('https://i0.wp.com');
    wpUrl.pathname = `/bibica.net/wp-content/uploads${url.pathname}`;
    wpUrl.search = url.search;

    try {
      const imageResponse = await fetch(wpUrl, {
        cf: {
          // Bật tính năng cache của Cloudflare
          cacheTtl: 63115200,
          cacheEverything: true
        },
        headers: {
          'Accept': 'image/webp',
          // Thêm header để tối ưu cache
          'Cache-Control': 'public, max-age=63115200'
        }
      });

      // Kiểm tra nếu response không thành công
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.status}`);
      }

      // Tạo headers object một lần và sử dụng lại
      const headers = new Headers({
        'cache-control': 'public, s-maxage=63115200, max-age=63115200',
        'content-type': 'image/webp',
        'X-Served-By': 'Cloudflare & Jetpack'
      });

      // Copy các headers quan trọng từ response gốc
      ['link', 'etag', 'last-modified', 'date', 'expires', 'x-nc'].forEach(header => {
        const value = imageResponse.headers.get(header);
        if (value) headers.set(header, value);
      });

      return new Response(imageResponse.body, { headers });
    } catch (error) {
      // Xử lý lỗi một cách graceful
      return new Response(`Error processing image: ${error.message}`, {
        status: 500,
        headers: {
          'content-type': 'text/plain',
          'cache-control': 'no-store'
        }
      });
    }
  }
};
