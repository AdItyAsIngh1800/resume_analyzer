import React from 'react';

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div className="max-w-xl mx-auto mt-16 p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold text-error">Something went wrong</h2>
          <p className="mt-2 text-sm text-gray-600">{this.state.error.message}</p>
          <button
            onClick={this.reset}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:opacity-90"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
