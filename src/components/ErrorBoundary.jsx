import { Component } from 'react';

// React has no hook equivalent for this — catching render-time errors in a
// subtree still requires a class component with getDerivedStateFromError /
// componentDidCatch. Only engages if a route actually throws while
// rendering; every normal path is completely unaffected.
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Uncaught error in route tree:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="route-error" role="alert">
          <p>Something went wrong loading this page.</p>
          <button type="button" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
