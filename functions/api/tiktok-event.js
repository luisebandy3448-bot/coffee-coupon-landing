// TikTok Events API - Cloudflare Pages Function
// Environment variable TIKTOK_ACCESS_TOKEN needs to be set in Cloudflare Dashboard
const TIKTOK_PIXEL_ID = 'D5N8BT3C77UFLMP0ARDG';
const TIKTOK_API_URL = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';

export async function onRequest(context) {
  const { request, env } = context;
    // Only handle POST requests
    if (request.method !== 'POST') {
      if (request.method === 'OPTIONS') {
        // Handle OPTIONS preflight request
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
      // Parse request body
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

      // Get client information
      const clientIP = request.headers.get('CF-Connecting-IP') || 
                      request.headers.get('X-Forwarded-For') || '';
      const userAgent = request.headers.get('user-agent') || '';
      const referer = request.headers.get('referer') || url || '';
      
      // Build TikTok Events API request body
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
            ip: clientIP.split(',')[0].trim() // Get first IP if proxy chain
          }
        },
        properties: {}
      };

      // Add event parameters
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

      // Get Access Token from environment variables
      const TIKTOK_ACCESS_TOKEN = env.TIKTOK_ACCESS_TOKEN;

      // If no access token, return error
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

      // Send request to TikTok Events API
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

      // Return success
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
