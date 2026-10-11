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
    let finalUrl = videoUrl;
    
    // Tự động giải mã link rút gọn (Douyin / Kuaishou) để lấy URL gốc đầy đủ
    if (videoUrl.includes('v.douyin.com') || videoUrl.includes('kuaishou.com') || videoUrl.includes('v.kuaishou.com')) {
      try {
        const redirectRes = await fetch(videoUrl, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
          }
        });
        finalUrl = redirectRes.url;
      } catch (e) {
        // Nếu không giải mã được thì giữ nguyên link gốc
      }
    }

    const apiEndpoint = `https://www.tikwm.com/api/?url=${encodeURIComponent(finalUrl)}`;
    
    const response = await fetch(apiEndpoint, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.tikwm.com/'
      }
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json;charset=UTF-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Lỗi kết nối máy chủ xử lý', details: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' }
    });
  }
}
