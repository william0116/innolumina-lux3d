/**
 * 独立部署防护层（standalone）：
 * 脱离妙搭平台后，client-toolkit-lite / observable-web 在模块初始化时仍会向
 * 平台运行时（/spark/...、/__runtime__/observability/...）发送时间戳校准、埋点上报、
 * 应用信息探测等请求。静态托管没有这些后端，会返回 404 的 HTML，进而引发 JSON
 * 解析报错。这里在应用代码最早执行的位置统一拦截，按各探测接口期望的结构伪造
 * 空成功响应，静默吞掉它们；其余业务请求（Lux3D 接口、远程图片等）一律放行。
 *
 * 仅在 standalone 构建启用；本地开发（dev）保持原样，便于调试。
 * 注意：本模块必须在 @lark-apaas/client-toolkit-lite 等平台模块之前被 import，
 * 以保证 patch 在平台模块顶层初始化前生效。
 */

const IS_STANDALONE = process.env.MIAODA_BUILD_TARGET === "standalone";

/** 平台运行时探测 / 埋点路径特征，命中即拦截 */
const PLATFORM_PROBE =
  /(\/spark\/|__runtime__\/api\/v1\/observability|\/observability\/(logs|traces|metrics)\/collect|observability\/app\/|current_server_timestamp|get_published)/;

function isProbeUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return PLATFORM_PROBE.test(url);
}

/** 按探测接口返回符合其解析结构的空成功响应 */
function probeResponseBody(url: string): { body: object; contentType: string } {
  // 时间戳校准：期望 res.data.timestampNs（纳秒），用当前时间换算，避免解构 undefined
  if (url.includes("current_server_timestamp")) {
    return {
      body: { data: { timestampNs: Date.now() * 1_000_000 } },
      contentType: "application/json",
    };
  }
  // 已发布应用信息：期望 res.code === 0，data 可为空
  if (url.includes("get_published")) {
    return { body: { code: 0, data: null }, contentType: "application/json" };
  }
  // 其余埋点上报（logs / traces / metrics collect）：空成功
  return { body: {}, contentType: "application/json" };
}

function jsonResponse(body: object): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function patchFetch() {
  if (!IS_STANDALONE || typeof window.fetch !== "function") return;
  const originalFetch = window.fetch.bind(window);

  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input?.toString();
    if (isProbeUrl(url)) {
      return Promise.resolve(jsonResponse(probeResponseBody(url as string).body));
    }
    return originalFetch(input, init);
  };
}

function patchXhr() {
  if (!IS_STANDALONE || typeof XMLHttpRequest === "undefined") return;
  const OriginalXhr = XMLHttpRequest;

  const PatchedXhr = function (this: XMLHttpRequest) {
    const xhr = new OriginalXhr();
    let probeUrl: string | null = null;

    const originalOpen = xhr.open.bind(xhr);
    xhr.open = function (method: string, url: string | URL, ...rest: any[]) {
      probeUrl = typeof url === "string" ? url : url.toString();
      if (isProbeUrl(probeUrl)) return; // 拦截：不真正打开连接
      // @ts-expect-error 透传原始 open 参数
      return originalOpen(method, url, ...rest);
    };

    const originalSend = xhr.send.bind(xhr);
    xhr.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
      if (isProbeUrl(probeUrl)) {
        const payload = probeUrl ? probeResponseBody(probeUrl).body : {};
        Object.defineProperty(xhr, "status", { value: 200, configurable: true });
        Object.defineProperty(xhr, "readyState", {
          value: 4,
          configurable: true,
        });
        Object.defineProperty(xhr, "responseText", {
          value: JSON.stringify(payload),
          configurable: true,
        });
        Object.defineProperty(xhr, "response", {
          value: JSON.stringify(payload),
          configurable: true,
        });
        if (typeof xhr.onreadystatechange === "function") xhr.onreadystatechange();
        if (typeof xhr.onload === "function") xhr.onload();
        return;
      }
      return originalSend(body);
    };

    return xhr as unknown as XMLHttpRequest;
  };

  (PatchedXhr as any).UNSENT = OriginalXhr.UNSENT;
  (PatchedXhr as any).OPENED = OriginalXhr.OPENED;
  (PatchedXhr as any).HEADERS_RECEIVED = OriginalXhr.HEADERS_RECEIVED;
  (PatchedXhr as any).LOADING = OriginalXhr.LOADING;
  (PatchedXhr as any).DONE = OriginalXhr.DONE;

  window.XMLHttpRequest = PatchedXhr as any;
}

// 模块加载即执行：必须早于 @lark-apaas/client-toolkit-lite 等平台模块的顶层初始化。
patchFetch();
patchXhr();
