import { useStudy, useTelemetry } from '@rssa-project/api';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import LoadingScreen from '../components/loadingscreen/LoadingScreen';
import { useNextButtonControl } from '../hooks/useNextButtonControl';
import { usePageCompletion } from '../hooks/usePageCompletion';
import { useStepCompletion } from '../hooks/useStepCompletion';
import SurveyTemplate from '../layouts/templates/SurveyTemplate';
import type { NavigationWrapper, SurveyPageType } from '../types/rssa.types';
import type { StudyLayoutContextType } from '../types/study.types';

const SurveyPage: React.FC = () => {
	const { studyStep, resetNextButton } = useOutletContext<StudyLayoutContextType>();
	const { studyApi } = useStudy();
	const [currentPageId, setCurrentPageId] = useState<string | null>(null);
	const { setIsStepComplete } = useStepCompletion();
	const { isPageComplete } = usePageCompletion();
	const { setButtonControl } = useNextButtonControl();

	const { trackEvent } = useTelemetry();
	const startTime = useRef<number>(0);

	const hasTrackedCompletion = useRef<boolean>(false);

	useEffect(() => {
		startTime.current = performance.now();
		hasTrackedCompletion.current = false;
	}, [currentPageId]);

	useEffect(() => {
		if (studyStep.survey_api_root) {
			setCurrentPageId(studyStep.survey_api_root);
		} else if (studyStep.root_page_info && studyStep.root_page_info.data) {
			setCurrentPageId(studyStep.root_page_info.data.id);
		}
	}, [studyStep.survey_api_root, studyStep.root_page_info]);

	const { data: surveyPageWrapper, isFetching } = useQuery({
		queryKey: ['surveyPage', currentPageId],
		queryFn: () => studyApi.get<NavigationWrapper<SurveyPageType>>(`pages/${currentPageId}`),
		enabled: !!currentPageId,
		refetchOnWindowFocus: false,
		initialData: () => {
			if (currentPageId && studyStep.root_page_info && studyStep.root_page_info.data.id === currentPageId) {
				return studyStep.root_page_info;
			}
			return undefined;
		},
	});

	useEffect(() => {
		if (isPageComplete && !hasTrackedCompletion.current && currentPageId) {
			const durationMs = Math.round(performance.now() - startTime.current);
			trackEvent('survey_page_completed', {
				page: currentPageId,
				duration_ms: durationMs,
			});
			hasTrackedCompletion.current = true;
		}
	}, [isPageComplete, trackEvent, currentPageId]);

	useEffect(() => {
		return () => {
			resetNextButton();
		};
	}, [resetNextButton]);

	useEffect(() => {
		if (!surveyPageWrapper) return;
		if (isFetching) {
			setButtonControl({ label: 'Loading...', action: () => {}, isDisabled: true });
			return;
		}

		if (surveyPageWrapper.next_id) {
			setButtonControl({
				label: 'Continue',
				action: () => {
					setButtonControl({ label: 'Loading...', action: () => {}, isDisabled: true });
					setCurrentPageId(surveyPageWrapper.next_id);
				},
				isDisabled: !isPageComplete,
			});
		} else {
			if (isPageComplete) {
				resetNextButton();
				setIsStepComplete(true);
			} else {
				setIsStepComplete(false);
			}
		}
	}, [isPageComplete, setButtonControl, resetNextButton, surveyPageWrapper, setIsStepComplete, isFetching]);
	if (!surveyPageWrapper) {
		return <LoadingScreen loading={true} message="Loading survey page..." />;
	}
	return (
		<div className="w-fit mx-auto px-3">
			<SurveyTemplate key={surveyPageWrapper.data.id} surveyPage={surveyPageWrapper.data} />
		</div>
	);
};

export default SurveyPage;
