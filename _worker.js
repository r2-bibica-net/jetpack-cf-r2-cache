export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname === 'i.bibica.net') {
      const wpUrl = new URL(request.url);
      wpUrl.hostname = 'i0.wp.com';
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      wpUrl.search = url.search;
      
      const wpRequest = new Request(wpUrl.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'image/webp'
        }
      });

      const imageResponse = await fetch(wpRequest);
      return new Response(imageResponse.body, {
        headers: {
          'content-type': 'image/webp'
        }
      });
    }
    return new Response(`Request not supported`, { status: 404 });
  }
};
