// TikTok Events API - Cloudflare Worker
// 环境变量 TIKTOK_ACCESS_TOKEN 需要在 wrangler.toml 或 Cloudflare Dashboard 中设置
const TIKTOK_PIXEL_ID = 'D5N8BT3C77UFLMP0ARDG';
const TIKTOK_API_URL = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';

export default {
  async fetch(request, env) {
    // 只处理POST请求
    if (request.method !== 'POST') {
      if (request.method === 'OPTIONS') {
        // 处理OPTIONS预检请求
        return new Response(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
          }
        });
      }
      
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    }

    try {
      // 解析请求体
      const requestData = await request.json();
      const {
        event_name,
        event_time,
        url,
        content_id,
        content_type,
        content_name,
        value,
        currency
      } = requestData;

      // 获取客户端信息
      const clientIP = request.headers.get('CF-Connecting-IP') || 
                      request.headers.get('X-Forwarded-For') || '';
      const userAgent = request.headers.get('user-agent') || '';
      const referer = request.headers.get('referer') || url || '';
      
      // 构建TikTok Events API请求体
      const tiktokPayload = {
        pixel_code: TIKTOK_PIXEL_ID,
        event: event_name,
        timestamp: event_time || Math.floor(Date.now() / 1000).toString(),
        context: {
          page: {
            url: referer
          },
          user: {
            user_agent: userAgent,
            ip: clientIP.split(',')[0].trim() // 获取第一个IP（如果是代理链）
          }
        },
        properties: {}
      };

      // 添加事件参数
      if (content_id) {
        tiktokPayload.properties.content_id = content_id;
      }
      if (content_type) {
        tiktokPayload.properties.content_type = content_type;
      }
      if (content_name) {
        tiktokPayload.properties.content_name = content_name;
      }
      if (value !== undefined) {
        tiktokPayload.properties.value = value;
      }
      if (currency) {
        tiktokPayload.properties.currency = currency;
      }

      // 获取环境变量中的 Access Token
      const TIKTOK_ACCESS_TOKEN = env.TIKTOK_ACCESS_TOKEN;

      // 如果没有access token，返回错误
      if (!TIKTOK_ACCESS_TOKEN) {
        console.error('TikTok ACCESS_TOKEN is not configured');
        return new Response(JSON.stringify({
          error: 'TikTok ACCESS_TOKEN is not configured. Please set it in Cloudflare environment variables.'
        }), {
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          }
        });
      }

      // 发送请求到TikTok Events API
      const response = await fetch(TIKTOK_API_URL, {
        method: 'POST',
        headers: {
          'Access-Token': TIKTOK_ACCESS_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tiktokPayload)
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('TikTok API Error:', responseData);
        return new Response(JSON.stringify({
          error: 'Failed to send event to TikTok',
          details: responseData
        }), {
          status: response.status || 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          }
        });
      }

      // 成功返回
      return new Response(JSON.stringify({
        success: true,
        message: 'Event sent to TikTok successfully',
        data: responseData
      }), {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });

    } catch (error) {
      console.error('Function Error:', error);
      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }), {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    }
  }
};
