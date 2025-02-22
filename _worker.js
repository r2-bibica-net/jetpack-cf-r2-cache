export function onRequest(context) {
  const url = new URL(context.request.url);
  let targetUrl = new URL(context.request.url);

  if (url.pathname.startsWith('/avatar')) {
    targetUrl.hostname = 'secure.gravatar.com';
    targetUrl.pathname = '/avatar' + url.pathname.slice(7);
    return proxyImage(context.request, targetUrl, 'Cloudflare Pages & Gravatar');
  }
  
  if (url.pathname.startsWith('/comment')) {
    targetUrl.hostname = 'i0.wp.com';
    targetUrl.pathname = '/comment.bibica.net/static/images' + url.pathname.slice(8);
    return proxyImage(context.request, targetUrl, 'Cloudflare Pages & Artalk & Jetpack');
  }

  // Default case
  targetUrl.hostname = 'i0.wp.com';
  targetUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
  targetUrl.search = url.search;
  return proxyImage(context.request, targetUrl, 'Cloudflare Pages & Jetpack');
}

async function proxyImage(request, targetUrl, provider) {
  const response = await fetch(targetUrl, {
    headers: { 'Accept': request.headers.get('Accept') || '*/*' }
  });

  return new Response(response.body, {
    headers: {
      'content-type': 'image/webp',
      'link': response.headers.get('link'),
      'X-Cache': response.headers.get('x-nc'),
      'X-Served-By': provider
    }
  });
}
