/**
 * InnoLumina · Lux3D 反向代理 Cloudflare Worker
 *
 * 作用：浏览器（GitHub Pages 纯静态）不能直连 Aholo 网关——网关实际 POST/GET 响应不带
 * Access-Control-Allow-Origin，会被浏览器 CORS 拦截（Failed to fetch）。本 Worker 作为
 * 同源可访问的中转：转发请求、在服务端持有并注入 API Key、为所有响应补齐 CORS 头。
 *
 * 上游：国内站 https://api.aholo3d.cn/lux3d/v1（与官方 SDK region=cn 一致）。
 * 前端生产 BASE_URL = https://<worker>.workers.dev/lux3d/v1
 */

const DEFAULT_UPSTREAM = 'https://api.aholo3d.cn/lux3d/v1';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'authorization,content-type',
  'Access-Control-Max-Age': '86400',
};

// 浏览器请求里不应透传给上游的 hop-by-hop / 主体相关头
const STRIP_HEADERS = new Set([
  'host',
  'origin',
  'referer',
  'content-length',
  'authorization',
  'connection',
  'accept-encoding',
]);

export default {
  async fetch(request, env) {
    // 1) 预检：直接返回 204 + CORS 头
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const upstreamBase = (env.UPSTREAM || DEFAULT_UPSTREAM).replace(/\/$/, '');
    const url = new URL(request.url);

    // 2a) 通用资源中转：/lux3d/v1/file?url=<encoded OUS/CDN GLB 地址>
    //     模型文件域名未必回 CORS 头，经 Worker 同源中转，保证 Three.js 加载与下载可用。
    if (url.pathname.endsWith('/file')) {
      const target = url.searchParams.get('url');
      if (!target || !/^https?:\/\//.test(target)) {
        return new Response(JSON.stringify({ c: '-1', m: 'missing or invalid url', d: null, f: null }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        });
      }
      try {
        const upstream = await fetch(target, { method: 'GET', headers: { 'User-Agent': 'aholo-worker-proxy/1.0' } });
        const body = await upstream.arrayBuffer();
        const headers = new Headers(CORS_HEADERS);
        const ct = upstream.headers.get('content-type');
        if (ct) headers.set('Content-Type', ct);
        return new Response(body, { status: upstream.status, headers });
      } catch (err) {
        return new Response(JSON.stringify({ c: '-1', m: `资源中转失败: ${err && err.message}`, d: null, f: null }), {
          status: 502,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        });
      }
    }

    // 2b) API 任务接口：取出 /lux3d/v1 之后的相对路径；若前端直接挂根路径，pathname 即相对路径
    let rel = url.pathname;
    const marker = '/lux3d/v1';
    const idx = rel.indexOf(marker);
    if (idx >= 0) rel = rel.slice(idx + marker.length);
    if (!rel.startsWith('/')) rel = `/${rel}`;

    const upstreamUrl = `${upstreamBase}${rel}${url.search}`;

    // 3) 组装上游请求头：透传 Content-Type，服务端注入 Authorization
    const headers = new Headers();
    for (const [k, v] of request.headers) {
      if (!STRIP_HEADERS.has(k.toLowerCase())) headers.set(k, v);
    }
    headers.set('Authorization', env.LUX3D_API_KEY);

    // 4) 转发请求体（GET/HEAD 不带 body）
    let body;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      body = await request.arrayBuffer();
    }

    let response;
    try {
      response = await fetch(upstreamUrl, {
        method: request.method,
        headers,
        body,
      });
    } catch (err) {
      // 上游连接失败：也必须带 CORS 头，否则浏览器同样抛 Failed to fetch
      return new Response(
        JSON.stringify({ c: '-1', m: `代理转发失败: ${err && err.message}`, d: null, f: null }),
        { status: 502, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    // 5) 复制上游响应并补齐 CORS 头
    const responseHeaders = new Headers(response.headers);
    for (const [k, v] of Object.entries(CORS_HEADERS)) responseHeaders.set(k, v);

    const responseBody = await response.arrayBuffer();
    return new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  },
};
