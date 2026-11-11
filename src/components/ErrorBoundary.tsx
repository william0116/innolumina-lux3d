import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-stone-50 to-amber-50 px-6">
          <div className="text-6xl mb-4">🪞</div>
          <h1 className="text-xl font-bold text-stone-800 mb-2 font-['Noto_Serif_SC']">
            琉璃晕开了，页面走丢了
          </h1>
          <p className="text-sm text-stone-500 mb-8 max-w-sm text-center leading-relaxed">
            别担心，您的作品都还在。这是一个意外错误，我们已记录。
          </p>
          <div className="flex gap-3">
            <Button onClick={this.handleReset} className="gap-2">
              <Home className="size-4" />
              回到首页
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="gap-2"
            >
              <RotateCcw className="size-4" />
              重试
            </Button>
          </div>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-8 text-xs text-stone-400 max-w-lg overflow-auto">
              {this.state.error.stack}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
