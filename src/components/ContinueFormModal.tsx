import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import clsx from 'clsx';
import { useEffect, useState, type FormEvent } from 'react';
import { Fragment } from 'react';
import CodeInput from './CodeInput';

const ContinueFormModal: React.FC<{
	title: string;
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (resumeCode: string) => void;
	isSubmitting: boolean;
	submitButtonText: string;
}> = ({ isOpen, onClose, title, onSubmit, isSubmitting = false, submitButtonText }) => {
	const [codeValue, setCodeValue] = useState<string>('');

	useEffect(() => {
		if (!isOpen) setCodeValue('');
	}, [isOpen]);

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (codeValue.length === 5) {
			onSubmit(codeValue);
		}
	};

	const isSubmitDisabled = isSubmitting || codeValue.length < 5;
	return (
		<Transition appear show={isOpen} as={Fragment}>
			<Dialog as="div" className="relative z-10" onClose={onClose}>
				<TransitionChild
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black/30" />
				</TransitionChild>
				<div className="fixed inset-0 flex w-screen items-center justify-center p-4">
					<TransitionChild
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0 scale-95"
						enterTo="opacity-100 scale-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100 scale-100"
						leaveTo="opacity-0 scale-95"
					>
						<DialogPanel className="min-w-md rounded-xl bg-gray-200 p-6 shadow-xl">
							<DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-600">
								{title}
							</DialogTitle>
							<form onSubmit={handleSubmit} className="mt-4 space-y-4">
								<label htmlFor={'resume_code'} className="block text-lg font-medium text-gray-700">
									Session code
								</label>
								<CodeInput value={codeValue} onChange={setCodeValue} length={5} />
								<div className="mt-6 flex justify-end space-x-2">
									<button
										type="button"
										onClick={onClose}
										className={clsx(
											'rounded-3 border border-gray-600 bg-gray-600',
											'me-2 px-4 py-2 text-sm font-medium text-gray-400',
											'shadow-sm hover:bg-gray-500'
										)}
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={isSubmitDisabled}
										className={clsx(
											'inline-flex justify-center',
											'rounded-3 border border-transparent bg-amber-500',
											'px-4 py-2 text-sm font-medium text-gray-600 shadow-sm hover:bg-amber-600',
											'disabled:opacity-50 disabled:cursor-not-allowed'
										)}
									>
										{isSubmitting ? 'Submitting...' : submitButtonText}
									</button>
								</div>
							</form>
						</DialogPanel>
					</TransitionChild>
				</div>
			</Dialog>
		</Transition>
	);
};

export default ContinueFormModal;
