export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // Lấy path từ URL request
  const path = url.pathname;

  // Tạo URL mới dựa trên path
  const newUrl = `https://i0.wp.com/bibica.net/wp-content/uploads${path}`;

  // Fetch dữ liệu từ URL mới
  const response = await fetch(newUrl, {
    cf: {
      cacheEverything: true,
      cacheTtl: 86400, // Cache trong 1 ngày
    },
  });

  // Trả về response từ fetch
  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
}
