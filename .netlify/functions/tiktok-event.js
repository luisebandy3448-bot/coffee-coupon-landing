// TikTok Events API - Netlify Function
// 需要从环境变量获取 ACCESS_TOKEN
const TIKTOK_ACCESS_TOKEN = process.env.TIKTOK_ACCESS_TOKEN || '';
const TIKTOK_PIXEL_ID = 'D5N8BT3C77UFLMP0ARDG';
const TIKTOK_API_URL = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';

exports.handler = async (event, context) => {
  // 只处理POST请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // 处理OPTIONS预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    // 解析请求体
    const requestData = JSON.parse(event.body);
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
    const ip = event.headers['x-forwarded-for'] || event.headers['x-nf-client-connection-ip'] || '';
    const userAgent = event.headers['user-agent'] || '';
    
    // 构建TikTok Events API请求体
    const tiktokPayload = {
      pixel_code: TIKTOK_PIXEL_ID,
      event: event_name,
      timestamp: event_time || Math.floor(Date.now() / 1000).toString(),
      context: {
        page: {
          url: url || event.headers.referer || ''
        },
        user: {
          user_agent: userAgent,
          ip: ip.split(',')[0].trim() // 获取第一个IP（如果是代理链）
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

    // 如果没有access token，返回错误
    if (!TIKTOK_ACCESS_TOKEN) {
      console.error('TikTok ACCESS_TOKEN is not configured');
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'TikTok ACCESS_TOKEN is not configured. Please set it in Netlify environment variables.'
        })
      };
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
      return {
        statusCode: response.status || 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'Failed to send event to TikTok',
          details: responseData
        })
      };
    }

    // 成功返回
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: 'Event sent to TikTok successfully',
        data: responseData
      })
    };

  } catch (error) {
    console.error('Function Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};
