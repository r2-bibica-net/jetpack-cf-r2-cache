export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Chuyển hướng i.bibica.net sang i0.wp.com/bibica.net/wp-content/uploads
    if (url.hostname === 'i.bibica.net') {
      if (url.pathname.startsWith('/comment/avatar')) {
        // Chuyển hướng i.bibica.net/comment/avatar sang https://gravatar.webp.se
        const gravatarUrl = new URL(request.url);
        gravatarUrl.hostname = 'secure.gravatar.com/avatar';
        gravatarUrl.pathname = url.pathname.replace('/comment/avatar', '');

        const gravatarResponse = await fetch(gravatarUrl, {
          headers: { 'Accept': request.headers.get('Accept') || '*/*' }
        });

        return new Response(gravatarResponse.body, {
          headers: {
            'content-type': 'image/webp',
            'link': gravatarResponse.headers.get('link'),
            'X-Cache': gravatarResponse.headers.get('x-nc'),
            'X-Served-By': 'Cloudflare Pages & Gravatar'
          }
        });
      } else if (url.pathname.startsWith('/comment')) {
        // Chuyển hướng i.bibica.net/comment sang https://comment.bibica.net/static/images
        const commentUrl = new URL(request.url);
        commentUrl.hostname = 'i0.wp.com';
        commentUrl.pathname = '/comment.bibica.net/static/images' + url.pathname.replace('/comment', '');

        const commentResponse = await fetch(commentUrl, {
          headers: { 'Accept': request.headers.get('Accept') || '*/*' }
        });

        return new Response(commentResponse.body, {
          headers: {
            'content-type': 'image/webp',
            'link': commentResponse.headers.get('link'),
            'X-Cache': commentResponse.headers.get('x-nc'),
            'X-Served-By': 'Cloudflare Pages & Comment Service'
          }
        });
      } else {
        // Chuyển hướng mặc định cho i.bibica.net
        const wpUrl = new URL(request.url);
        wpUrl.hostname = 'i0.wp.com';
        wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
        wpUrl.search = url.search;

        const imageResponse = await fetch(wpUrl, {
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
    }

    // Trả về lỗi 404 nếu không khớp với bất kỳ quy tắc nào
    return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { status: 404 });
  }
};
