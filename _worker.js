export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // Lấy đường dẫn và tham số truy vấn từ URL
  const path = url.pathname;
  const query = url.search;

  // Base URL của WordPress (https://i0.wp.com/bibica.net/wp-content/uploads)
  const baseURL = "https://i0.wp.com/bibica.net/wp-content/uploads";

  // Tạo URL mới
  const newURL = `${baseURL}${path}${query}`;

  // Fetch từ URL mới
  const response = await fetch(newURL);

  // Trả về response từ URL mới
  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
}
