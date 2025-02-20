export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Danh sách các quy tắc chuyển hướng
    const redirectRules = [
      // Quy tắc mặc định cho i.bibica.net (ưu tiên lên đầu)
      {
        hostname: 'i.bibica.net',
        pathPrefix: '/', // Áp dụng cho tất cả các đường dẫn
        targetHostname: 'i0.wp.com',
        targetPathPrefix: '/bibica.net/wp-content/uploads',
        servedBy: 'Cloudflare Pages & Jetpack'
      },
      // Quy tắc cho i.bibica.net/675
      {
        hostname: 'i.bibica.net',
        pathPrefix: '/675',
        targetHostname: '155.248.213.121:2121',
        targetPathPrefix: '/',
        servedBy: 'Cloudflare Pages & IP'
      },
      // Các quy tắc khác
      {
        hostname: 'i.bibica.net',
        pathPrefix: '/avatar',
        targetHostname: 'secure.gravatar.com',
        targetPathPrefix: '/avatar',
        servedBy: 'Cloudflare Pages & Gravatar'
      },
      {
        hostname: 'i.bibica.net',
        pathPrefix: '/comment',
        targetHostname: 'i0.wp.com',
        targetPathPrefix: '/comment.bibica.net/static/images',
        servedBy: 'Cloudflare Pages & Artalk & Jetpack'
      },
      {
        hostname: 'i.bibica.net',
        pathPrefix: '/go',
        targetHostname: 'example.com', // Thay thế bằng hostname mục tiêu
        targetPathPrefix: '/new-path', // Thay thế bằng path mục tiêu
        servedBy: 'Cloudflare Pages & New Service'
      }
      // Thêm các quy tắc khác ở đây
    ];

    // Tìm quy tắc phù hợp
    const matchedRule = redirectRules.find(rule => 
      url.hostname === rule.hostname && url.pathname.startsWith(rule.pathPrefix)
    );

    if (matchedRule) {
      const targetUrl = new URL(request.url);
      const [targetHost, targetPort] = matchedRule.targetHostname.split(':');
      targetUrl.hostname = targetHost;
      targetUrl.port = targetPort || ''; // Xử lý cổng
      targetUrl.pathname = matchedRule.targetPathPrefix.replace(/\/$/, '') + url.pathname.replace(matchedRule.pathPrefix, '');
      targetUrl.search = url.search;

      const response = await fetch(targetUrl, {
        headers: { 'Accept': request.headers.get('Accept') || '*/*' }
      });

      // Kiểm tra phản hồi
      if (!response.ok) {
        return new Response(`Failed to fetch image from ${targetUrl}`, { status: response.status });
      }

      // Lấy các header cụ thể từ phản hồi
      const linkHeader = response.headers.get('link');
      const xCacheHeader = response.headers.get('x-nc');

      return new Response(response.body, {
        headers: {
          'content-type': response.headers.get('content-type') || 'image/webp', // Sử dụng content-type từ phản hồi gốc
          'link': linkHeader || '',
          'X-Cache': xCacheHeader || '',
          'X-Served-By': matchedRule.servedBy
        }
      });
    }

    // Trả về lỗi 404 nếu không khớp với bất kỳ quy tắc nào
    return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { status: 404 });
  }
};
