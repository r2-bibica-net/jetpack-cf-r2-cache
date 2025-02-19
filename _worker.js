export default {
  async fetch(request) {
    try {
      const url = new URL(request.url);
      
      if (url.hostname !== 'i.bibica.net') {
        return new Response('Request not supported', { 
          status: 404,
          statusText: 'Not Found'
        });
      }

      // Tối ưu URL construction
      const wpUrl = new URL('https://i0.wp.com');
      wpUrl.pathname = `/bibica.net/wp-content/uploads${url.pathname}`;
      wpUrl.search = url.search;

      const imageResponse = await fetch(wpUrl, {
        cf: {
          // Tối ưu edge caching
          cacheTtl: 63115200,
          cacheEverything: true,
        },
        headers: {
          'Accept': 'image/webp',
          'Accept-Encoding': 'br, gzip',
          'Connection': 'keep-alive'
        }
      });

      if (!imageResponse.ok) {
        throw new Error(`Image fetch failed: ${imageResponse.status}`);
      }

      // Tối ưu response headers
      const headers = new Headers({
          'cache-control': 'public, s-maxage=63115200',
          'content-type': 'image/webp',
          'link': imageResponse.headers.get('link'),
          'etag': imageResponse.headers.get('etag'),
          'last-modified': imageResponse.headers.get('last-modified'),
          'date': imageResponse.headers.get('date'),
          'expires': imageResponse.headers.get('expires'),
          'x-nc': imageResponse.headers.get('x-nc'),
          'X-Served-By': 'Cloudflare & Jetpack'
      });

      return new Response(imageResponse.body, { headers });
      
    } catch (error) {
      console.error(`Error processing request: ${error.message}`);
      return new Response('Internal Server Error', { 
        status: 500,
        statusText: error.message
      });
    }
  }
};
