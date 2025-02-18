export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname === 'i.bibica.net') {
      // Normalize URL
      const wpUrl = new URL(request.url);
      wpUrl.hostname = 'i0.wp.com';
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      wpUrl.search = url.search;

      // Strip request xuống mức tối thiểu
      const strippedRequest = new Request(wpUrl.toString());
      const normalizedRequest = new Request(strippedRequest, {
        method: 'GET',
        headers: {
          'Accept': 'image/webp',
          'Accept-Encoding': 'identity',  // Ngăn nén để đảm bảo response nhất quán
          'User-Agent': 'Cloudflare-Pages', // UA cố định
          'Host': 'i0.wp.com'
        },
        redirect: 'follow'
      });

      // Fetch với request đã normalize
      const imageResponse = await fetch(normalizedRequest);

      // Đảm bảo response headers nhất quán
      return new Response(imageResponse.body, {
        headers: {
          'content-type': 'image/webp',
          'Cache-Control': 'public, max-age=31536000',
          'content-length': imageResponse.headers.get('content-length')
        }
      });
    }
    return new Response(`Request not supported`, { status: 404 });
  }
};
