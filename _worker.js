export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.hostname === 'i.bibica.net') {
      let targetUrl = new URL(request.url);
      
      // Handle different path patterns
      if (url.pathname.startsWith('/comment/avatar')) {
        // Route for Gravatar images
        targetUrl.hostname = 'gravatar.webp.se';
        targetUrl.pathname = url.pathname.replace('/comment/avatar', '');
      } else if (url.pathname.startsWith('/comment')) {
        // Route for comment static images
        targetUrl.hostname = 'comment.bibica.net';
        targetUrl.pathname = '/static/images' + url.pathname.replace('/comment', '');
      } else {
        // Default WordPress media route
        targetUrl.hostname = 'i0.wp.com';
        targetUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      }
      
      targetUrl.search = url.search;

      const imageResponse = await fetch(targetUrl, {
        headers: { 'Accept': request.headers.get('Accept') || '*/*' }
      });

      return new Response(imageResponse.body, {
        headers: {
          'content-type': 'image/webp',
          'link': imageResponse.headers.get('link'),
          'X-Cache': imageResponse.headers.get('x-nc'),
          'X-Served-By': 'Cloudflare Pages & Jetpack'
        }
      });
    }
    
    return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { status: 404 });
  }
};
