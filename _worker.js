export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    if (url.hostname !== 'i.bibica.net') {
      return new Response('Not found', { status: 404 });
    }

    // Set Accept header ngay từ đầu
    const headers = {
      'Accept': 'image/webp,*/*'
    };

    let targetUrl;
    if (url.pathname.startsWith('/avatar')) {
      targetUrl = `https://secure.gravatar.com/avatar${url.pathname.slice(7)}`;
    } else if (url.pathname.startsWith('/comment')) {
      targetUrl = `https://i0.wp.com/comment.bibica.net/static/images${url.pathname.slice(8)}`;
    } else {
      targetUrl = `https://i0.wp.com/bibica.net/wp-content/uploads${url.pathname}${url.search}`;
    }

    return fetch(targetUrl, { headers });
  }
};
