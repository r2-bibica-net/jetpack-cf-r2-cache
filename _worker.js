export async function onRequest(context) {
  // Lấy request từ context
  const { request } = context;

  // Lấy URL gốc từ request
  const url = new URL(request.url);

  // Đường dẫn gốc cần thay thế
  const originalBaseUrl = "https://i0.wp.com/bibica.net/wp-content/uploads";

  // Xây dựng lại đường dẫn mới
  const newPathname = url.pathname;

  // Tạo URL mới dựa trên originalBaseUrl và newPathname
  const targetUrl = new URL(originalBaseUrl + newPathname);

  // Copy query parameters từ request ban đầu
  targetUrl.search = url.search;

  // Forward request đến targetUrl
  const modifiedRequest = new Request(targetUrl.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });

  // Fetch dữ liệu từ targetUrl và trả về response
  const response = await fetch(modifiedRequest);

  // Trả về response với các header phù hợp
  return new Response(response.body, response);
}
