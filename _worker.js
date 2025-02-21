export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    if (url.hostname === 'i.bibica.net') {
      // Chuẩn hóa Accept header cho mọi request
      const standardAccept = 'image/webp';
      
      if (url.pathname.startsWith('/avatar')) {
        const gravatarUrl = new URL(request.url);
        gravatarUrl.hostname = 'secure.gravatar.com';
        gravatarUrl.pathname = '/avatar' + url.pathname.replace('/avatar', '');
        
        const gravatarResponse = await fetch(gravatarUrl, {
          headers: { 'Accept': standardAccept }
        });

        return new Response(gravatarResponse.body, {
          headers: {
            'content-type': 'image/webp',
            'Cache-Control': 'public, max-age=31536000',
            'X-Cache': gravatarResponse.headers.get('x-nc'),
            'X-Served-By': 'Cloudflare Pages & Gravatar'
          }
        });
      } else if (url.pathname.startsWith('/comment')) {
        const commentUrl = new URL(request.url);
        commentUrl.hostname = 'i0.wp.com';
        commentUrl.pathname = '/comment.bibica.net/static/images' + url.pathname.replace('/comment', '');
        
        // Xóa query string không cần thiết
        commentUrl.search = '';
        
        const commentResponse = await fetch(commentUrl, {
          headers: { 'Accept': standardAccept }
        });

        return new Response(commentResponse.body, {
          headers: {
            'content-type': 'image/webp',
            'Cache-Control': 'public, max-age=31536000',
            'X-Cache': commentResponse.headers.get('x-nc'),
            'X-Served-By': 'Cloudflare Pages & Artalk & Jetpack'
          }
        });
      } else {
        const wpUrl = new URL(request.url);
        wpUrl.hostname = 'i0.wp.com';
        wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
        
        // Giữ lại các query string cần thiết cho wp.com
        const validParams = ['w', 'h', 'quality', 'strip'];
        const params = new URLSearchParams();
        for (const [key, value] of new URLSearchParams(url.search)) {
          if (validParams.includes(key)) {
            params.append(key, value);
          }
        }
        wpUrl.search = params.toString();

        const imageResponse = await fetch(wpUrl, {
          headers: { 'Accept': standardAccept }
        });

        return new Response(imageResponse.body, {
          headers: {
            'content-type': 'image/webp',
            'Cache-Control': 'public, max-age=31536000',
            'X-Cache': imageResponse.headers.get('x-nc'),
            'X-Served-By': 'Cloudflare Pages & Jetpack'
          }
        });
      }
    }

    return new Response(`Request not supported: ${url.hostname}`, { status: 404 });
  }
};
