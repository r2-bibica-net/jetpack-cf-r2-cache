export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname === 'i.bibica.net') {
      const pagesUrl = new URL(request.url);
      pagesUrl.hostname = 'i.bibica.net';
      pagesUrl.pathname = '/images' + url.pathname;
      pagesUrl.search = url.search;  // Giữ nguyên params từ Jetpack
      
      return Response.redirect(pagesUrl.toString(), 302);
    }
    return new Response(`Not found`, { status: 404 });
  }
};
