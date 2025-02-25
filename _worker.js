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

async function serveAsset(request, event, context) {
  const url = new URL(request.url);
  const cache = caches.default;
  let response = await cache.match(request);

  if (response) {
    return response;
  }

  const rule = Object.entries(rules).find(([prefix]) => url.pathname.startsWith(prefix));
  if (!rule) {
    return new Response(`Path not supported: ${url.pathname}`, { status: 404 });
  }

  const [prefix, config] = rule;
  const targetUrl = new URL(request.url);
  targetUrl.hostname = config.targetHost;
  targetUrl.pathname = config.pathTransform(url.pathname, prefix);
  targetUrl.search = url.search;

  response = await fetch(targetUrl, {
    headers: { 'Accept': request.headers.get('Accept') || '*/*' }
  });

  const headers = new Headers(response.headers);
  headers.set("cache-control", `public, max-age=31536000`);
  headers.set("vary", "Accept");
  headers.set('X-Served-By', `Cloudflare Pages & ${config.service}`);

  response = new Response(response.body, { ...response, headers });
  context.waitUntil(cache.put(request, response.clone()));

  return response;
}

export default {
  async fetch(request, event, context) {
    let response = await serveAsset(request, event, context);
    if (!response || response.status > 399) {
      response = new Response(response.statusText, { status: response.status });
    }
    return response;
  },
};
