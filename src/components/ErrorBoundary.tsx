"use client";

import { Component, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("[ErrorBoundary]", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="min-h-[200px] flex items-center justify-center p-8">
            <div className="text-center">
              <span
                className="material-symbols-outlined text-error"
                style={{ fontSize: 40 }}
              >
                error
              </span>
              <h2 className="font-h3 text-h3 text-on-surface mt-3">
                Something went wrong
              </h2>
              <p className="text-on-surface-variant mt-1 text-body-md">
                {this.state.error?.message || "An unexpected error occurred."}
              </p>
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="mt-4 px-4 py-2 rounded-lg bg-primary text-on-primary font-semibold text-body-md hover:opacity-90"
              >
                Try again
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
