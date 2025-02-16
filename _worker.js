export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.hostname === 'images.bibica.net') {
      const wpUrl = new URL(request.url);
      wpUrl.hostname = 'i0.wp.com';
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      wpUrl.search = url.search;

      try {
        const imageResponse = await fetch(wpUrl, {
          headers: {
            'Accept': request.headers.get('Accept') || '*/*'
          }
        });
        
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status}`);
        }

        return new Response(imageResponse.body, {
          headers: {
            'content-type': imageResponse.headers.get('content-type'),
            'cache-control': 'public, max-age=31536000',
            'cdn-cache-control': 'max-age=31536000',
            'vary': 'Accept'
          }
        });
      } catch (error) {
        console.error('Error:', error);
        return fetch(new Request(wpUrl, request));
      }
    }

    return new Response('Not Found', { status: 404 });
  }
};
