import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	errorMessage: string;
}

class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
		errorMessage: "",
	};

	public static getDerivedStateFromError(error: Error): State {
		return { hasError: true, errorMessage: error.message };
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("Uncaught error:", error, errorInfo);
	}

	public render() {
		if (this.state.hasError) {
			return (
				<div className="p-2 align-content-center">
					<h1>Application Error</h1>
					<p className="text-red-500">A critical configuration is missing.</p>
					<pre className="mt-3 p-3 bg-gray-200">{this.state.errorMessage}</pre>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
