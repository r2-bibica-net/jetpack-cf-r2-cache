export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // Định nghĩa rules cho việc chuyển hướng
    const rules = {
      '/avatar': {
        targetHost: 'secure.gravatar.com',
        pathTransform: (path, prefix) => '/avatar' + path.replace(prefix, ''),
        service: 'Gravatar'
      },
      '/comment': {
        targetHost: 'i0.wp.com',
        pathTransform: (path, prefix) => '/comment.bibica.net/static/images' + path.replace(prefix, ''),
        service: 'Artalk & Jetpack'
      },
      '/': {
        targetHost: 'i0.wp.com',
        pathTransform: (path) => '/bibica.net/wp-content/uploads' + path,
        service: 'Jetpack'
      }
    };

    // Tìm rule phù hợp
    const rule = Object.entries(rules).find(([prefix]) => url.pathname.startsWith(prefix));
    
    if (!rule) {
      return new Response(`Path not supported: ${url.pathname}`, { status: 404 });
    }

    // Tạo URL mới theo rule
    const targetUrl = new URL(request.url);
    const [prefix, config] = rule;
    targetUrl.hostname = config.targetHost;
    targetUrl.pathname = config.pathTransform(url.pathname, prefix);
    targetUrl.search = url.search;

    // Thực hiện request
    const response = await fetch(targetUrl, {
      headers: { 'Accept': request.headers.get('Accept') || '*/*' }
    });

    // Lấy headers từ response gốc
    const headers = new Headers(response.headers);
    
    // Xóa các headers không cần thiết
    headers.delete('last-modified');
    headers.delete('nel');

    // Set các headers tùy chỉnh
    headers.set('content-type', 'image/webp');
    headers.set('X-Cache', response.headers.get('x-nc'));
    headers.set('X-Served-By', `Cloudflare Pages & ${config.service}`);

    // Trả về response với headers đã được chỉnh sửa
    return new Response(response.body, { headers });
  }
};
