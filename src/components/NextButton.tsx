import { Button } from '@headlessui/react';
import clsx from 'clsx';

interface NextButtonProps {
	handleClick: () => void;
	disabled: boolean;
	loading: boolean;
	children: string;
}

const NextButton: React.FC<NextButtonProps> = ({ handleClick, disabled, loading = false, children }) => (
	<Button
		as="button"
		onClick={handleClick}
		disabled={disabled || loading}
		className={clsx(
			'px-6 py-3 rounded-lg font-medium transition-colors duration-200',
			disabled
				? 'bg-orange-300 cursor-not-allowed text-gray-400'
				: 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer shadow-sm'
		)}
	>
		{loading ? (
			<div className="inset-0 opacity-100 z-50 rounded-b-md flex items-center justify-center">
				<p className="me-3">Loading</p>
				<svg
					className="animate-spin h-6 w-6 text-white"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle
						className="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						strokeWidth="4"
					></circle>
					<path
						className="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					></path>
				</svg>
			</div>
		) : (
			children
		)}
	</Button>
);

export default NextButton;
