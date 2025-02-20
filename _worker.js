export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Bảng ánh xạ đường dẫn
    const pathMappings = [
      { prefix: '/comment/avatar', target: 'https://gravatar.webp.se' },
      { prefix: '/comment', target: 'https://comment.bibica.net/static/images' },
      { prefix: '/', target: 'https://i0.wp.com/bibica.net/wp-content/uploads' }
    ];

    if (url.hostname === 'i.bibica.net') {
      // Tìm URL mapping phù hợp
      const mapping = pathMappings.find(m => url.pathname.startsWith(m.prefix));

      if (mapping) {
        const targetUrl = `${mapping.target}${url.pathname.replace(m.prefix, '')}${url.search}`;

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
    }

    return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { status: 404 });
  }
};
