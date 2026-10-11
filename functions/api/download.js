export async function onRequest(context) {
  const url = new URL(context.request.url);
  const videoUrl = url.searchParams.get('url');

  if (!videoUrl) {
    return new Response(JSON.stringify({ code: -1, msg: 'Thiếu liên kết video' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    let finalUrl = videoUrl;
    
    // Giải mã link rút gọn Douyin / Kuaishou
    if (videoUrl.includes('v.douyin.com') || videoUrl.includes('kuaishou.com') || videoUrl.includes('v.kuaishou.com')) {
      try {
        const redirectRes = await fetch(videoUrl, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15'
          }
        });
        finalUrl = redirectRes.url;
      } catch (e) {}
    }

    // Gọi API tikwm chính thống
    const apiEndpoint = `https://www.tikwm.com/api/?url=${encodeURIComponent(finalUrl)}&hd=1`;
    
    const response = await fetch(apiEndpoint, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.tikwm.com/'
      }
    });

    const data = await response.json();

    // Kiểm tra nếu API trả về không có dữ liệu video
    if (!data || data.code !== 0 || !data.data || (!data.data.play && !data.data.hdplay)) {
      return new Response(JSON.stringify({ 
        code: -1, 
        msg: "API không trả về được video. Link có thể đã hết hạn hoặc bị chặn." 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8', 'Access-Control-Allow-Origin': '*' }
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json;charset=UTF-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ code: -1, msg: 'Lỗi máy chủ: ' + err.message }), {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
