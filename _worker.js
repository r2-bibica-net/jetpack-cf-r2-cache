export default {
  async fetch(request) {
    const url = new URL(request.url);

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

    const rule = Object.entries(rules).find(([prefix]) => url.pathname.startsWith(prefix));

    if (!rule) {
      return new Response(`Path not supported: ${url.pathname}`, { status: 404 });
    }

    const targetUrl = new URL(request.url);
    const [prefix, config] = rule;
    targetUrl.hostname = config.targetHost;
    targetUrl.pathname = config.pathTransform(url.pathname, prefix);
    targetUrl.search = url.search;

    const response = await fetch(targetUrl, {
      headers: { 'Accept': request.headers.get('Accept') || '*/*' }
    });

    return new Response(response.body, {
      headers: {
        'content-type': 'image/webp',
        'X-Content-Type-Options': 'nosniff',
        'link': response.headers.get('link'),
        'X-Cache': response.headers.get('x-nc'),
        'X-Served-By': `Cloudflare Pages & ${config.service}`
      }
    });
  }
};
