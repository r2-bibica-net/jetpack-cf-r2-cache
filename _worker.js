export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    if (url.hostname !== 'i.bibica.net') {
      return new Response('Not found', { status: 404 });
    }

    let targetUrl;
    let source;

    if (url.pathname.startsWith('/avatar')) {
      targetUrl = `https://secure.gravatar.com/avatar${url.pathname.slice(7)}`;
      source = 'Gravatar';
    } else if (url.pathname.startsWith('/comment')) {
      targetUrl = `https://i0.wp.com/comment.bibica.net/static/images${url.pathname.slice(8)}`;
      source = 'Artalk & Jetpack';
    } else {
      targetUrl = `https://i0.wp.com/bibica.net/wp-content/uploads${url.pathname}${url.search}`;
      source = 'Jetpack';
    }

    return fetch(targetUrl);
  }
};
