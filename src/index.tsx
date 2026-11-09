import "./lib/platform-guard";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { AppContainer } from "@lark-apaas/client-toolkit-lite";
import App from "./app";
import "./index.css";

/** 可见的错误兜底：任何组件抛错都直接在页面上展示，避免静默白屏。 */
function VisibleErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: unknown;
  resetErrorBoundary: () => void;
}) {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    <div
      style={{
        margin: 40,
        padding: 24,
        borderRadius: 12,
        background: "#fff3f3",
        border: "1px solid #e8b4b4",
        color: "#8a2a2a",
        fontFamily: "ui-monospace, monospace",
        whiteSpace: "pre-wrap",
        fontSize: 13,
      }}
    >
      <strong style={{ fontSize: 15 }}>应用渲染出错</strong>
      <div style={{ marginTop: 12 }}>{msg}</div>
      <button
        onClick={resetErrorBoundary}
        style={{ marginTop: 16, padding: "6px 16px", borderRadius: 8, cursor: "pointer" }}
      >
        重试
      </button>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={process.env.CLIENT_BASE_PATH || "/"}>
      <AppContainer>
        <ErrorBoundary fallbackRender={({ error, resetErrorBoundary }) => (
          <VisibleErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
        )}>
          <App />
        </ErrorBoundary>
      </AppContainer>
    </BrowserRouter>
  </StrictMode>,
);
