import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useStudy } from '@rssa-project/api';
import { useStudyUrlParams } from '../contexts/StudyUrlParamsContext';

import type { StudyStep } from '../types/rssa.types';

interface FeedbackPayload {
	study_step_id: string;
	study_step_page_id: string | null;
	context_tag: string;
	feedback_text: string;
	feedback_type: string;
	feedback_category: string;
}

interface FeedbackResponse {
	id: string; // UUID
}

import type { ToastType } from './TestModeToast';

interface TestFeedbackModalProps {
	isOpen: boolean;
	onClose: () => void;
	studyStep?: StudyStep;
	onShowToast: (message: string, type: ToastType) => void;
}

const TestFeedbackModal: React.FC<TestFeedbackModalProps> = ({ isOpen, onClose, studyStep, onShowToast }) => {
	const { studyApi } = useStudy();
	// const { studyStep } = useOutletContext<StudyLayoutContextType>();
	const { externalId } = useStudyUrlParams();

	const [name, setName] = useState('');
	const [subject, setSubject] = useState(''); // Note: API doesn't have subject field in BaseSchema, but user asked for it. Maybe prepend to message?
	const [message, setMessage] = useState('');
	const [feedbackId, setFeedbackId] = useState<string | null>(null);

	// Derive context_tag: <pid/sid>-<name>
	// User said: "pid/sid collected from the url param... if it is missing it should simply be n/a"
	// participantTypeKey defaults to "unknown", externalId defaults to "N/A"
	// "The specific format for the context_tag should be <code>-<name>"
	// I will use externalId if it's not "N/A", otherwise participantTypeKey?
	// Or maybe "participantTypeKey-externalId-name"?
	// User said: "The context_tag should be the pid/sid collected from the url param, if it is missing it should simply be n/a, followed by the Name field's text. The format... should be <code>-<name>"
	// So likely: `externalId` (the code) + "-" + `name`.
	const contextTagCode = externalId !== 'N/A' ? externalId : 'n/a';
	const contextTag = `${contextTagCode}-${name || 'Anonymous'}`;

	const feedbackMutation = useMutation({
		mutationFn: async () => {
			// Prepend subject to message if subject exists, as API doesn't have a dedicated subject field
			const fullMessage = subject ? `Subject: ${subject}\n\n${message}` : message;

			const payload: FeedbackPayload = {
				study_step_id: studyStep?.id || '',
				study_step_page_id: null,
				context_tag: contextTag,
				feedback_text: fullMessage,
				feedback_type: 'study_step_page',
				feedback_category: 'test-feedback',
			};

			if (feedbackId) {
				// MATCH: PATCH /feedbacks/{id}
				await studyApi.patch<FeedbackPayload, void>(`feedbacks/${feedbackId}`, payload);
				return { id: feedbackId };
			} else {
				// MATCH: POST /feedbacks/
				const res = await studyApi.post<FeedbackPayload, FeedbackResponse>('feedbacks/', payload);
				return res; // Assuming res is the object with .id
			}
		},
		onSuccess: (data) => {
			if (data && data.id) {
				setFeedbackId(data.id);
			}
			// Don't close immediately? Or show success message?
			// User said "Once a feedback for a page is posted, we want it to be editable"
			// So keeping it open or allowing re-open is fine.
			// Show toast and close
			onShowToast('Feedback sent successfully!', 'success');
			onClose();
		},
		onError: (error) => {
			console.error('Failed to submit feedback:', error);
			onShowToast('Failed to submit feedback. Please try again.', 'error');
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		feedbackMutation.mutate();
	};

	return (
		<Dialog open={isOpen} onClose={onClose} className="relative z-[200]">
			<div className="fixed inset-0 bg-black/30" aria-hidden="true" />

			<div className="fixed inset-0 flex w-screen items-center justify-center p-4">
				<DialogPanel className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-xl border border-gray-200">
					<DialogTitle className="font-bold text-lg text-gray-900">Submit Test Feedback</DialogTitle>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700">Your Name / Test ID</label>
							<input
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-2 border"
								placeholder="e.g. John Doe"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">Subject</label>
							<input
								type="text"
								value={subject}
								onChange={(e) => setSubject(e.target.value)}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-2 border"
								placeholder="Brief summary"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">Message</label>
							<textarea
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								rows={4}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-2 border"
								placeholder="Describe your feedback..."
								required
							/>
						</div>

						<div className="flex justify-end gap-3 pt-2">
							<button
								type="button"
								onClick={onClose}
								className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition-colors"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={feedbackMutation.isPending}
								className="px-4 py-2 rounded-md bg-amber-600 text-white hover:bg-amber-700 font-medium transition-colors disabled:opacity-50"
							>
								{feedbackMutation.isPending ? 'Sending...' : feedbackId ? 'Update' : 'Send'}
							</button>
						</div>
					</form>
				</DialogPanel>
			</div>
		</Dialog>
	);
};

export default TestFeedbackModal;
