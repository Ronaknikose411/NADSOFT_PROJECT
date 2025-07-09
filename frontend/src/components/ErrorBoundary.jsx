import React, { Component } from 'react'

class ErrorBoundary extends Component {
  state = {
    hasError: false,
    error: null,
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="alert alert-danger">
          <h4>Something went wrong.</h4>
          <p>{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <p>Please try refreshing the page or contact support.</p>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary