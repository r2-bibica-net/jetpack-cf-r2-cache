export default {
  async fetch(request) {
    try {
      const url = new URL(request.url);

      // Giữ nguyên phần mapping
      const pathMappings = [
        { prefix: '/comment/avatar', target: 'https://gravatar.webp.se' },
        { prefix: '/comment', target: 'https://comment.bibica.net/static/images' },
        { prefix: '/', target: 'https://i0.wp.com/bibica.net/wp-content/uploads' }
      ];

      if (url.hostname === 'i.bibica.net') {
        const mapping = pathMappings.find(m => url.pathname.startsWith(m.prefix));

        if (mapping) {
          const targetUrl = `${mapping.target}${url.pathname.replace(mapping.prefix, '')}${url.search}`;

          const imageResponse = await fetch(targetUrl, {
            headers: request.headers // Chuyển tiếp headers gốc
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

      return new Response(`Request not supported: ${url.hostname}`, { status: 404 });
    } catch (error) {
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  }
};
