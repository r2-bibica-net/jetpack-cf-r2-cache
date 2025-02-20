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
      targetUrl.hostname = matchedRule.targetHostname;
      targetUrl.pathname = matchedRule.targetPathPrefix + url.pathname.replace(matchedRule.pathPrefix, '');
      targetUrl.search = url.search;

      const response = await fetch(targetUrl, {
        headers: { 'Accept': request.headers.get('Accept') || '*/*' }
      });

      // Lấy các header cụ thể từ phản hồi
      const linkHeader = response.headers.get('link');
      const xCacheHeader = response.headers.get('x-nc');

      return new Response(response.body, {
        headers: {
          'content-type': 'image/webp',
          'link': linkHeader || '', // Đảm bảo không bị lỗi nếu header không tồn tại
          'X-Cache': xCacheHeader || '', // Đảm bảo không bị lỗi nếu header không tồn tại
          'X-Served-By': matchedRule.servedBy
        }
      });
    }

    // Trả về lỗi 404 nếu không khớp với bất kỳ quy tắc nào
    return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { status: 404 });
  }
};
