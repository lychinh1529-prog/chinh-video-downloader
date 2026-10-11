export async function onRequest(context) {
  const url = new URL(context.request.url);
  const videoUrl = url.searchParams.get('url');

  if (!videoUrl) {
    return new Response(JSON.stringify({ error: 'Thiếu liên kết video' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' }
    });
  }

  try {
    const apiEndpoint = `https://www.tikwm.com/api/?url=${encodeURIComponent(videoUrl)}`;
    const response = await fetch(apiEndpoint);
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json;charset=UTF-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Lỗi kết nối máy chủ xử lý' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' }
    });
  }
}
