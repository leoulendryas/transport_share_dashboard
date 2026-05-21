// src/components/ApiErrorBoundary.tsx
'use client';

import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ApiErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('API Error Boundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center p-8 min-h-[200px] bg-rose-50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/50 rounded-2xl text-center space-y-4">
          <div className="h-12 w-12 flex items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black text-rose-950 dark:text-rose-50 uppercase tracking-widest">Something went wrong</h3>
            <p className="text-xs font-medium text-rose-600/80 dark:text-rose-400/80">{this.state.message}</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={this.handleReset}
            className="border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50"
          >
            <RefreshCcw className="w-3 h-3 mr-2" />
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
