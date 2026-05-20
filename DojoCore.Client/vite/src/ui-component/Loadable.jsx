import { Component, Suspense } from 'react';

// project imports
import Loader from './Loader';

// ── Error boundary to catch lazy-import failures ──────────────────────────────
class ChunkErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error) {
    // If it's a dynamic import failure (chunk not found), hard-reload once.
    // This recovers from stale Vite dev-server cache without an infinite loop.
    if (
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('error loading dynamically imported module') ||
      error?.name === 'ChunkLoadError'
    ) {
      const key = `chunk_reload_${window.location.pathname}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        window.location.reload();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, textAlign: 'center' }}>
          <p style={{ color: '#d32f2f', fontWeight: 600 }}>
            Failed to load this page. Please refresh.
          </p>
          <button onClick={() => window.location.reload()} style={{ marginTop: 8 }}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Loadable(Component) {
  const WrappedComponent = (props) => (
    <ChunkErrorBoundary>
      <Suspense fallback={<Loader />}>
        <Component {...props} />
      </Suspense>
    </ChunkErrorBoundary>
  );

  return WrappedComponent;
}
