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

    // Sử dụng endpoint thay thế không bị giới hạn 10k request khắt khe
    const apiEndpoint = `https://api.douyin.wtf/api?url=${encodeURIComponent(finalUrl)}`;
    
    const response = await fetch(apiEndpoint, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const rawData = await response.json();

    // Chuẩn hóa dữ liệu trả về khớp hoàn toàn với giao diện của bạn
    const data = {
      code: 0,
      data: {
        hdplay: rawData.video_url || rawData.nwm_video_url || rawData.url,
        play: rawData.video_url || rawData.nwm_video_url || rawData.url,
        music: rawData.music_url || rawData.music,
        cover: rawData.cover_url || rawData.cover,
        title: rawData.title || "Video không logo",
        author: {
          nickname: rawData.author || "Tác giả",
          avatar: rawData.avatar || ""
        }
      }
    };

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json;charset=UTF-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ code: -1, msg: "Lỗi xử lý: " + err.message }), {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
