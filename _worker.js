export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.hostname !== 'i.bibica.net') {
      return new Response(`Request not supported: ${url.hostname} does not match any rules.`, { status: 404 });
    }

    try {
      const wpUrl = new URL('https://i0.wp.com/bibica.net/wp-content/uploads' + url.pathname + url.search);

      const standardizedHeaders = {
        ':authority': 'i.bibica.net',
        ':method': 'GET',
        ':path': url.pathname + url.search,
        ':scheme': 'https',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'vi',
        'cache-control': 'no-cache',
        'pragma': 'no-cache',
        'priority': 'u=0, i',
        'sec-ch-ua': '"Microsoft Edge";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0'
      };

      const imageResponse = await fetch(wpUrl.toString(), {
        method: standardizedHeaders[':method'],
        headers: standardizedHeaders
      });

      if (!imageResponse.ok) {
        return new Response('Failed to fetch image from upstream server.', { status: imageResponse.status });
      }

      return new Response(imageResponse.body, {
        headers: {
          'cache-control': 'public, s-maxage=63115200, immutable',
          'content-type': 'image/webp',
          'etag': imageResponse.headers.get('etag'),
          'last-modified': imageResponse.headers.get('last-modified'),
          'date': imageResponse.headers.get('date'),
          'expires': imageResponse.headers.get('expires'),
          'x-nc': imageResponse.headers.get('x-nc'),
          'X-Served-By': 'Cloudflare & Jetpack',
          'Vary': 'Accept'
        }
      });
    } catch (error) {
      return new Response('An error occurred while processing the request.', { status: 500 });
    }
  }
};
