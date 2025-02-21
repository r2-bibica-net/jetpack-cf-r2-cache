export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    if (url.hostname === 'i.bibica.net') {
        // Lấy tất cả các headers từ request gốc để xem có gì
      const originalHeaders = {};
      for (const [key, value] of request.headers) {
        console.log(`${key}: ${value}`);
        originalHeaders[key] = value;
      }
      console.log('Request URL:', request.url);
      console.log('Original Headers:', originalHeaders);
      };

      if (url.pathname.startsWith('/avatar')) {
        const gravatarUrl = new URL(request.url);
        gravatarUrl.hostname = 'secure.gravatar.com';
        gravatarUrl.pathname = '/avatar' + url.pathname.replace('/avatar', '');
        
        const gravatarResponse = await fetch(gravatarUrl, {
          headers: normalizedHeaders
        });

        return new Response(gravatarResponse.body, {
          headers: {
            'content-type': 'image/webp',
            'Cache-Control': 'public, s-maxage=86400',
            'X-Cache': gravatarResponse.headers.get('x-nc'),
            'X-Served-By': 'Cloudflare Pages & Gravatar'
          }
        });

      } else if (url.pathname.startsWith('/comment')) {
        const commentUrl = new URL(request.url);
        commentUrl.hostname = 'i0.wp.com';
        commentUrl.pathname = '/comment.bibica.net/static/images' + url.pathname.replace('/comment', '');
        
        const commentResponse = await fetch(commentUrl, {
          headers: normalizedHeaders
        });

        return new Response(commentResponse.body, {
          headers: {
            'content-type': 'image/webp',
            'Cache-Control': 'public, s-maxage=86400',
            'X-Cache': commentResponse.headers.get('x-nc'),
            'X-Served-By': 'Cloudflare Pages & Artalk & Jetpack'
          }
        });

      } else {
        const wpUrl = new URL(request.url);
        wpUrl.hostname = 'i0.wp.com';
        wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
        wpUrl.search = url.search;
        
        const imageResponse = await fetch(wpUrl, {
          headers: normalizedHeaders
        });

        return new Response(imageResponse.body, {
          headers: {
            'content-type': 'image/webp',
            'Cache-Control': 'public, s-maxage=86400',
            'X-Cache': imageResponse.headers.get('x-nc'),
            'X-Served-By': 'Cloudflare Pages & Jetpack'
          }
        });
      }
    }

    return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { status: 404 });
  }
};
