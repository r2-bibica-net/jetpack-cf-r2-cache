export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname === 'i.bibica.net') {
      const wpUrl = new URL(request.url);
      wpUrl.hostname = 'i0.wp.com';
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      wpUrl.search = url.search;

      // Chỉ forward một số headers cần thiết
      const headers = new Headers();
      headers.set('Accept', request.headers.get('Accept') || '*/*');
      
      const imageResponse = await fetch(wpUrl, { headers });

      // Tạo response với headers được chuẩn hóa
      const responseHeaders = new Headers({
        'Content-Type': imageResponse.headers.get('content-type'),
        'Cache-Control': 'public, max-age=31536000, immutable, no-transform',
        'CDN-Cache-Control': 'public, max-age=31536000, immutable, no-transform',
        'Surrogate-Control': 'public, max-age=31536000, immutable, no-transform',
        'Link': imageResponse.headers.get('Link'),
        'X-Served-By': 'Cloudflare & Jetpack'
      });

      return new Response(imageResponse.body, {
        headers: responseHeaders
      });
    }
    return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { status: 404 });
  }
};
