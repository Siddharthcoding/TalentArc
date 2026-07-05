import { Component } from 'react';
import ErrorModal from './ErrorModal';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorModal
          error={{
            title: 'Something went wrong',
            message: this.state.error?.message || 'An unexpected error occurred in the dashboard.',
          }}
          onRetry={this.handleReset}
          onReset={this.handleReset}
        />
      );
    }
    return this.props.children;
  }
}
