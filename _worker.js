// Thêm logs để debug
const routes = [
  {
    hostname: 'i.bibica.net',
    pathPrefix: '/avatar',
    targetHostname: 'secure.gravatar.com', 
    targetPathPrefix: '',  // Sửa lại để khớp với code gốc
    pathTransform: (path) => '/avatar' + path.slice('/avatar'.length),
    servedBy: 'Cloudflare Pages & Gravatar'
  },
  {
    hostname: 'i.bibica.net',
    pathPrefix: '/comment',
    targetHostname: 'i0.wp.com',
    targetPathPrefix: '', // Sửa lại để khớp với code gốc
    pathTransform: (path) => '/comment.bibica.net/static/images' + path.slice('/comment'.length),
    servedBy: 'Cloudflare Pages & Artalk & Jetpack'
  },
  {
    hostname: 'i.bibica.net',
    pathPrefix: '/',
    targetHostname: 'i0.wp.com',
    targetPathPrefix: '', // Sửa lại để khớp với code gốc
    pathTransform: (path) => '/bibica.net/wp-content/uploads' + path,
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

    // Tạo URL đích
    const targetUrl = new URL(request.url);
    targetUrl.hostname = matchedRoute.targetHostname;
    targetUrl.pathname = matchedRoute.pathTransform(url.pathname);
    targetUrl.search = url.search;

    console.log('Original URL:', url.toString());
    console.log('Target URL:', targetUrl.toString());

    // Fetch response
    const response = await fetch(targetUrl, {
      headers: {
        'Accept': request.headers.get('Accept') || '*/*'
      }
    });

    // Log response status
    console.log('Response status:', response.status);

    // Kiểm tra nếu response không ok
    if (!response.ok) {
      console.error('Response not OK:', response.status, response.statusText);
      return new Response(`Failed to fetch: ${response.status} ${response.statusText}`, {
        status: response.status
      });
    }

    return new Response(response.body, {
      headers: {
        'content-type': 'image/webp',
        'link': response.headers.get('link') || '',
        'X-Cache': response.headers.get('x-nc') || '',
        'X-Served-By': matchedRoute.servedBy
      }
    });
  }
};
