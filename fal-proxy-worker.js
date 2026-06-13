// Content VA — fal.ai Proxy Worker
// Deploy this to Cloudflare Workers to bypass CORS

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    // Only allow POST and GET
    if (!['POST', 'GET'].includes(request.method)) {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      // Get the fal.ai path from the URL
      const url = new URL(request.url);
      const falPath = url.pathname.replace('/fal/', '');
      const falUrl = 'https://queue.fal.run/' + falPath + url.search;

      // Forward request to fal.ai with your API key
      const falRequest = new Request(falUrl, {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Key ' + env.FAL_KEY,
        },
        body: request.method === 'POST' ? request.body : undefined,
      });

      const falResponse = await fetch(falRequest);
      const data = await falResponse.text();

      return new Response(data, {
        status: falResponse.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
  }
};
