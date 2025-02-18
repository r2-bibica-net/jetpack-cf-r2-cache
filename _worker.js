export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    if (url.hostname === 'i.bibica.net') {
      // Chuyển request sang i0.wp.com
      const wpUrl = new URL(request.url);
      wpUrl.hostname = 'i0.wp.com';
      wpUrl.pathname = '/bibica.net/wp-content/uploads' + url.pathname;
      wpUrl.search = url.search;
      
      // Lấy ảnh từ Jetpack
      const response = await fetch(wpUrl);
      
      // Trả về response với headers gốc từ Jetpack
      return response;
    }

    return new Response(`Not found`, { status: 404 });
  }
}
