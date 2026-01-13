
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Standard React Error Boundary component.
 * Explicitly extending Component with generics ensures base members like props, state, 
 * and setState are correctly inherited and recognized by the TypeScript compiler.
 */
export class ErrorBoundary extends Component<Props, State> {
  // Use property initializer for state to ensure it's correctly typed on the instance.
  // This addresses the error: Property 'state' does not exist on type 'ErrorBoundary'
  public state: State = {
    hasError: false,
    error: null
  };

  // Re-declaring props to resolve visibility issues in some TS environments.
  // This fix addresses errors where 'props' was not recognized on line 43 and 57.
  public props: Props;

  // Adding constructor to help the compiler recognize inherited members and initialize 'props'.
  constructor(props: Props) {
    super(props);
    this.props = props;
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render(): ReactNode {
    // Access state and props from the base Component class.
    // This fix addresses errors where 'state', 'props', and 'setState' were not recognized.
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg shadow-sm m-4">
          <h2 className="text-xl font-bold text-red-800 mb-2">Something went wrong</h2>
          <p className="text-red-600 mb-4">
            {this.props.fallback ? 'A localized UI crash occurred.' : this.state.error?.message}
          </p>
          <button
            // Use setState method from the base class by casting 'this' to any to satisfy the environment-specific compiler
            onClick={() => (this as any).setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    // Access props from the base class
    return this.props.children;
  }
}
