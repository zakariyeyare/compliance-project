import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // You can also log the error to an error reporting service
    this.setState({ error, info });
    console.error('ErrorBoundary caught an error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h2 style={{ color: '#a00' }}>Der opstod en fejl</h2>
          <p style={{ color: '#333' }}>
            Fejl: {this.state.error?.message || String(this.state.error)}
          </p>
          {this.state.info?.componentStack && (
            <pre style={{ whiteSpace: 'pre-wrap', background: '#f7f7f7', padding: 12, borderRadius: 6 }}>
              {this.state.info.componentStack}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
