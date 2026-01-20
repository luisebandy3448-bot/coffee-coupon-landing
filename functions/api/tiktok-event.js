// TikTok Events API - Cloudflare Pages Function
// Environment variable TIKTOK_ACCESS_TOKEN needs to be set in Cloudflare Dashboard
const TIKTOK_PIXEL_ID = 'D5N8BT3C77UFLMP0ARDG';
// TikTok Events API v1.3 unified endpoint
const TIKTOK_API_URL = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';

export async function onRequest(context) {
  const { request, env } = context;
  
  // Log all requests for debugging
  console.log('Function called:', {
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries())
  });
  
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
      console.log('Parsing request body...');
      const requestData = await request.json();
      console.log('Request data received:', requestData);
      const {
        event_name,
        event_time,
        url,
        content_id,
        content_type,
        content_name,
        value,
        currency,
        event_id,
        // Customer information parameters (optional)
        email,
        phone,
        external_id,
        ttclid,
        ttp
      } = requestData;

      // Get client information
      const clientIP = request.headers.get('CF-Connecting-IP') || 
                      request.headers.get('X-Forwarded-For') || '';
      const userAgent = request.headers.get('user-agent') || '';
      const referer = request.headers.get('referer') || url || '';
      
      // Build TikTok Events API request body
      // Using event/track endpoint format for v1.3 (unified endpoint)
      // Structure: { event_source, event_source_id, data: [{ event, event_time, event_id, user, properties }] }
      const eventTime = event_time || Math.floor(Date.now() / 1000);
      const generatedEventId = event_id || `${event_name}_${eventTime}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Build user object
      const userObj = {};
      if (userAgent) userObj.user_agent = userAgent;
      if (clientIP) userObj.ip = clientIP.split(',')[0].trim();
      if (email) userObj.email = email;
      if (phone) userObj.phone = phone;
      if (external_id) userObj.external_id = external_id;
      
      // Build properties object
      const propertiesObj = {};
      if (url) propertiesObj.url = url;
      if (value !== undefined) propertiesObj.value = value;
      if (currency) propertiesObj.currency = currency;
      
      // Add content_id (required parameter)
      if (content_id) {
        // Use contents array format (recommended by TikTok)
        if (!propertiesObj.contents) {
          propertiesObj.contents = [];
        }
        propertiesObj.contents.push({
          content_id: content_id,
          ...(content_type && { content_type: content_type }),
          ...(content_name && { content_name: content_name })
        });
        
        // Also add content_id directly to properties (for compatibility)
        propertiesObj.content_id = content_id;
      }
      
      // Add content_type and content_name if provided
      if (content_type) propertiesObj.content_type = content_type;
      if (content_name) propertiesObj.content_name = content_name;
      
      // Build event object (inside data array)
      const eventObj = {
        event: event_name,
        event_time: eventTime.toString(),
        event_id: generatedEventId,
        user: userObj,
        properties: propertiesObj
      };
      
      // Add page context if URL is available
      if (referer || url) {
        eventObj.context = {
          page: {
            url: referer || url || ''
          }
        };
      }
      
      // Add ad parameters if available
      if (ttclid || ttp) {
        if (!eventObj.context) eventObj.context = {};
        eventObj.context.ad = {};
        if (ttclid) eventObj.context.ad.callback = ttclid;
        if (ttp) eventObj.context.ad.ttp = ttp;
      }
      
      // Build final payload with correct structure
      const tiktokPayload = {
        event_source: 'web',
        event_source_id: TIKTOK_PIXEL_ID,
        data: [eventObj]
      };

      // Log payload for debugging (remove in production if needed)
      console.log('TikTok API Payload:', JSON.stringify(tiktokPayload, null, 2));

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
      // Payload structure: { event_source, event_source_id, data: [{ event, event_time, event_id, user, properties, context }] }
      const apiResponse = await fetch(TIKTOK_API_URL, {
        method: 'POST',
        headers: {
          'Access-Token': TIKTOK_ACCESS_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tiktokPayload)
      });

      // Log response status for debugging
      console.log('TikTok API Response Status:', apiResponse.status);
      console.log('TikTok API Response Headers:', Object.fromEntries(apiResponse.headers.entries()));
      
      let responseData;
      const responseText = await apiResponse.text();
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse TikTok API response:', responseText);
        responseData = { 
          error: 'Invalid JSON response', 
          raw: responseText,
          status: apiResponse.status,
          statusText: apiResponse.statusText
        };
      }

      if (!apiResponse.ok) {
        console.error('TikTok API Error Details:', {
          status: apiResponse.status,
          statusText: apiResponse.statusText,
          url: TIKTOK_API_URL,
          payload: tiktokPayload,
          response: responseData
        });
        return new Response(JSON.stringify({
          error: 'Failed to send event to TikTok',
          status: apiResponse.status,
          statusText: apiResponse.statusText,
          details: responseData,
          payload_sent: tiktokPayload
        }), {
          status: apiResponse.status || 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          }
        });
      }
      
      // Log success for debugging
      console.log('TikTok API Success Response:', responseData);
      
      // Check if TikTok returned any warnings or errors in success response
      if (responseData.data && responseData.data.length > 0) {
        responseData.data.forEach((eventResult, index) => {
          if (eventResult.error_code !== 0) {
            console.warn(`TikTok Event ${index} warning:`, eventResult);
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
