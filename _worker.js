export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    if (url.hostname !== 'i.bibica.net') {
      return new Response(`Request not supported`, { status: 404 });
    }

    let targetUrl = new URL(request.url);
    let source = '';

    // Xử lý routing
    if (url.pathname.startsWith('/avatar')) {
      targetUrl.hostname = 'secure.gravatar.com';
      targetUrl.pathname = '/avatar' + url.pathname.replace('/avatar', '');
      source = 'Gravatar';
    } else if (url.pathname.startsWith('/comment')) {
      targetUrl.hostname = 'i0.wp.com';
      targetUrl.pathname = '/comment.bibica.net/static/images' + url.pathname.replace('/comment', '');
      source = 'Artalk & Jetpack';
    } else {
      targetUrl.hostname = 'i0.wp.com'; 
      targetUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      targetUrl.search = url.search;
      source = 'Jetpack';
    }

    try {
      const sourceResponse = await fetch(targetUrl.toString());

      return new Response(sourceResponse.body, {
        headers: {
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=31536000',
          'X-Served-By': `Cloudflare Pages & ${source}`
        }
      });
    } catch (error) {
      return new Response('Error fetching image', { status: 500 });
    }
  }
};
