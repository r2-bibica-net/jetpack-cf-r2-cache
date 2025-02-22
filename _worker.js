const ROUTES = new Map([
  ['/avatar', {
    target: 'secure.gravatar.com',
    transform: path => '/avatar' + path.slice(7),
    provider: 'Cloudflare Pages & Gravatar'
  }],
  ['/comment', {
    target: 'i0.wp.com',
    transform: path => '/comment.bibica.net/static/images' + path.slice(8),
    provider: 'Cloudflare Pages & Artalk & Jetpack'
  }]
]);

export function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;
  
  const route = ROUTES.get(path.slice(0, path.indexOf('/', 1))) || {
    target: 'i0.wp.com',
    transform: p => '/bibica.net/wp-content/uploads' + p,
    provider: 'Cloudflare Pages & Jetpack'
  };

  const targetUrl = new URL(context.request.url);
  targetUrl.hostname = route.target;
  targetUrl.pathname = route.transform(path);

  return fetch(targetUrl, {
    headers: { Accept: context.request.headers.get('Accept') || '*/*' }
  }).then(res => new Response(res.body, {
    headers: {
      'content-type': 'image/webp',
      'link': res.headers.get('link'),
      'X-Cache': res.headers.get('x-nc'),
      'X-Served-By': route.provider
    }
  }));
}
