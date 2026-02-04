import { useMutation } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParticipant, useStudy } from '@rssa-project/api';
import { useStudyConfig } from '@rssa-project/api';
import ContinueFormModal from '../components/ContinueFormModal';
import Header from '../layouts/StudyHeader';
import WelcomeFooter from '../layouts/WelcomeFooter';

export interface ResumePayload {
	resume_code: string;
}
export interface ResumeResponse {
	current_step_id: string;
	current_page_id: string;
	token: string;
}

interface WelcomePageProps {
	isStudyReady?: boolean;
	onStudyStart?: () => void;
	title?: string;
	subtitle?: string;
	ContentComponent?: React.FC;
	children?: React.ReactNode;
}

const WelcomePage: React.FC<WelcomePageProps> = ({
	isStudyReady = false,
	onStudyStart,
	title = 'Welcome!',
	subtitle = 'Thank you for participating in The Peer Recommendation Platform study. Your involvement is crucial for our research.',
	ContentComponent,
	children,
}) => {
	const [showCodeForm, setShowCodeForm] = useState<boolean>(false);

	const { studyApi } = useStudy();
	const { setJwt } = useParticipant();
	const studyId = useMemo(() => studyApi.getStudyId(), [studyApi]);

	const { data: config } = useStudyConfig(studyId!);

	const navigate = useNavigate();

	const resumeMutation = useMutation({
		mutationFn: (resumeCode: string) => {
			return studyApi.post<ResumePayload, ResumeResponse>(`studies/${studyId}/resume`, {
				resume_code: resumeCode,
			});
		},
		onSuccess: (data: ResumeResponse) => {
			setJwt(data.token);
			const stepFromConfig = config?.steps.find((step) => step.step_id === data.current_step_id);
			if (stepFromConfig) navigate(stepFromConfig.path);
			else throw new Error('Something went wrong. Could not resolve resume path.');
		},
		onError: (error) => {
			console.error('Resume failed:', error.message);
		},
	});

	return (
		<div className="p-5 m-5">
			<Header title={title} content={subtitle} />
			<ContinueFormModal
				isOpen={showCodeForm}
				onClose={() => setShowCodeForm(false)}
				title="Resume previous session"
				onSubmit={(code) => resumeMutation.mutate(code)}
				isSubmitting={resumeMutation.isPending}
				submitButtonText="Submit"
			/>
			<div className="m-3 p-5 text-left rounded-3">{ContentComponent ? <ContentComponent /> : children}</div>
			<WelcomeFooter
				onStudyStart={onStudyStart || (() => {})}
				onStudyContinue={setShowCodeForm}
				disabled={!isStudyReady}
				text={'Start study'}
			/>
		</div>
	);
};

export default WelcomePage;
