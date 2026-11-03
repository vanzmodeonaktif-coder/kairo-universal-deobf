import { DeobfuscationPipeline } from './deobf/pipeline.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS Headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // API Route: Deobfuscation
    if (url.pathname === '/api/deobf' && request.method === 'POST') {
      try {
        const { code, options } = await request.json();
        if (!code) throw new Error('Code is required');

        const pipeline = new DeobfuscationPipeline(code, options || {});
        const result = await pipeline.execute();

        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    // Serve Frontend (Static Assets from bucket)
    // Cloudflare Workers with [site] bucket automatically serve public files.
    // Fallback to index.html for SPA routing if needed.
    return env.ASSETS.fetch(request);
  }
};
