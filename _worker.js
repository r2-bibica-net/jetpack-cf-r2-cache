export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    if (url.hostname === 'i.bibica.net') {
      const wpUrl = new URL(request.url);
      wpUrl.hostname = 'i0.wp.com';
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      wpUrl.search = url.search;
      
      const imageResponse = await fetch(wpUrl, {
        headers: {
          'Accept': request.headers.get('Accept') || '*/*'
        }
      });

      // Copy các headers quan trọng từ response gốc
      const headers = new Headers(imageResponse.headers);
      
      // Thêm cache control headers
      headers.set('Cache-Control', 'public, max-age=31536000'); // Cache 1 năm
      
      return new Response(imageResponse.body, {
        headers: headers,
        status: imageResponse.status,
        statusText: imageResponse.statusText
      });
    }
    
    return new Response(`Request not supported: ${url.hostname} does not match any rules.`, {
      status: 404 
    });
  }
};
