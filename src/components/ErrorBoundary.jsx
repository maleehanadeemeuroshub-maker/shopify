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
    console.error('[ErrorBoundary] Uncaught error in subtree:', error, info);
  }

  render() {
    if (this.state.hasError) {
      // `fallback` lets optional/decorative subtrees (a WebGL background
      // effect, say) disappear silently instead of showing this route-level
      // "something went wrong, reload" message, which would be a confusing
      // non-sequitur for something the user never asked to load in the
      // first place.
      if (this.props.fallback !== undefined) return this.props.fallback;
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
