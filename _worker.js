const routes = [
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
    pathPrefix: '/',
    targetHostname: 'i0.wp.com',
    targetPathPrefix: '/bibica.net/wp-content/uploads',
    servedBy: 'Cloudflare Pages & Jetpack'
  }
];

export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    if (url.hostname !== 'i.bibica.net') {
      return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { 
        status: 404 
      });
    }

    // Tìm route phù hợp
    const matchedRoute = routes.find(
      route => url.pathname.startsWith(route.pathPrefix)
    ) || routes[routes.length - 1];

    // Tạo URL đích và giữ nguyên query parameters
    const targetUrl = new URL(request.url);
    targetUrl.hostname = matchedRoute.targetHostname;
    targetUrl.pathname = matchedRoute.targetPathPrefix + 
                        url.pathname.slice(matchedRoute.pathPrefix.length);
    targetUrl.search = url.search; // Giữ nguyên query parameters

    // Fetch response với header Accept gốc
    const response = await fetch(targetUrl, {
      headers: {
        'Accept': request.headers.get('Accept') || '*/*'
      }
    });

    // Lấy các header cụ thể từ phản hồi
    const linkHeader = response.headers.get('link');
    const xCacheHeader = response.headers.get('x-nc');

    return new Response(response.body, {
      headers: {
        'content-type': 'image/webp',
        'link': linkHeader || '',
        'X-Cache': xCacheHeader || '',
        'X-Served-By': matchedRoute.servedBy
      }
    });
  }
};
