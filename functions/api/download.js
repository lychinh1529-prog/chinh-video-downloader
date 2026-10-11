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
    
    // Giải mã link rút gọn nếu có
    if (videoUrl.includes('v.douyin.com') || videoUrl.includes('kuaishou.com')) {
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

    // Sử dụng API dự phòng ổn định hơn
    const apiEndpoint = `https://api.douyin.wtf/api?url=${encodeURIComponent(finalUrl)}`;
    
    const response = await fetch(apiEndpoint, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const data = await response.json();

    // Chuẩn hóa dữ liệu trả về cho đồng bộ với giao diện
    const formattedData = {
      code: 0,
      data: {
        hdplay: data.video_url || data.nwm_video_url || data.url,
        play: data.video_url || data.nwm_video_url || data.url,
        music: data.music_url || data.music,
        cover: data.cover_url || data.cover,
        title: data.title || "Video Douyin / Kuaishou",
        author: {
          nickname: data.author || "Tác giả",
          avatar: data.avatar || ""
        }
      }
    };

    return new Response(JSON.stringify(formattedData), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json;charset=UTF-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Lỗi kết nối máy chủ', details: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' }
    });
  }
}
