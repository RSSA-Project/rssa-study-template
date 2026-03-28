import { CheckIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import React, { useState } from 'react';

interface CopyToClipboardButtonProps {
	textToCopy: string;
	animated?: boolean;
	showLabel?: boolean;
	className?: string;
}

export const CopyToClipboardButton: React.FC<CopyToClipboardButtonProps> = ({
	textToCopy,
	animated = false,
	showLabel = false,
	className = '',
}) => {
	const [isCopied, setIsCopied] = useState(false);

	const handleCopy = async () => {
		if (isCopied) return;
		try {
			await navigator.clipboard.writeText(textToCopy);
			setIsCopied(true);
			setTimeout(() => {
				setIsCopied(false);
			}, 2000);
		} catch (err) {
			console.error('Failed to copy text: ', err);
		}
	};

	return (
		<button
			onClick={handleCopy}
			className={clsx(
				'flex items-center gap-2 px-3 py-1.5 text-sm font-medium',
				'rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
				'cursor-pointer',
				{
					'bg-purple-300 text-gray-700 hover:text-gray-100 hover:bg-purple-600 focus:ring-yellow-400':
						!isCopied,
					'bg-green-500 text-white focus:ring-green-500': isCopied,
				},
				className
			)}
		>
			{animated ? (
				<>
					<div className="relative w-5 h-5">
						<CheckIcon
							className={clsx(
								'absolute transition-all duration-300 ease-in-out',
								isCopied
									? 'opacity-100 scale-100 rotate-0' // When copied: visible
									: 'opacity-0 scale-50 -rotate-90' // Default state: hidden
							)}
						/>
						<ClipboardDocumentIcon
							className={clsx(
								'absolute transition-all duration-300 ease-in-out',
								isCopied
									? 'opacity-0 scale-50 rotate-90' // When copied: hidden
									: 'opacity-100 scale-100 rotate-0' // Default state: visible
							)}
						/>
					</div>
					{showLabel && <span>{isCopied ? 'Copied!' : 'Copy'}</span>}
				</>
			) : (
				<>
					{isCopied ? (
						<>
							<CheckIcon className="w-5 h-5" />
							{showLabel && <span>Copied!</span>}
						</>
					) : (
						<>
							<ClipboardDocumentIcon className="w-5 h-5" />
							{showLabel && <span>Copy</span>}
						</>
					)}
				</>
			)}
		</button>
	);
};
