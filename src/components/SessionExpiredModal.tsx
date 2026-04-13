import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

const SessionExpiredModal: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		// Listen for the custom event fired by React Query
		const handleUnauthorized = () => {
			setIsOpen(true);
		};

		window.addEventListener('rssa-unauthorized', handleUnauthorized);

		return () => {
			window.removeEventListener('rssa-unauthorized', handleUnauthorized);
		};
	}, []);

	// Intentionally omitting an onClose handler.
	// If they are 401'd, we want a "hard stop" so they can't dismiss the modal and click broken UI.
	return (
		<Dialog open={isOpen} onClose={() => {}} className="relative z-[100]">
			{/* The backdrop */}
			<div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

			{/* The modal placement */}
			<div className="fixed inset-0 flex items-center justify-center p-4">
				<DialogPanel className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 text-center transform transition-all">
					<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
						<ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
					</div>

					<DialogTitle className="text-xl font-bold text-gray-900 mb-2">
						Session Expired or Unauthorized
					</DialogTitle>

					<div className="text-gray-600 space-y-4 text-sm text-left">
						<p>
							You are unauthorized to access this page. If you are a study participant, your session has
							likely expired due to inactivity or a network change.
						</p>
						<div className="bg-gray-50 p-3 rounded-md border border-gray-200">
							<p className="font-semibold text-gray-900 mb-1">To continue your progress:</p>
							<ul className="list-disc pl-5 space-y-1">
								<li>
									Use the <strong>session code</strong> provided to you at the beginning of the study
									to resume.
								</li>
								<li>Alternatively, you may start the study again from the beginning.</li>
							</ul>
						</div>
						<p className="font-medium text-amber-700 bg-amber-50 p-2 rounded text-center border border-amber-200">
							You must return to the study using the original source link that was given to you.
						</p>
					</div>
				</DialogPanel>
			</div>
		</Dialog>
	);
};

export default SessionExpiredModal;
