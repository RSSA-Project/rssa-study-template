import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useStudy } from 'rssa-api';
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

    useEffect(() => {
        if (studyStep.survey_api_root) {
            setCurrentPageId(studyStep.survey_api_root);
        } else if (studyStep.root_page_info && studyStep.root_page_info.data) {
            setCurrentPageId(studyStep.root_page_info.data.id);
        }
    }, [studyStep.survey_api_root, studyStep.root_page_info]);

    const {
        data: surveyPageWrapper,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['surveyPage', currentPageId],
        queryFn: () => studyApi.get<NavigationWrapper<SurveyPageType>>(`pages/${currentPageId}`),
        enabled: !!currentPageId,
        refetchOnWindowFocus: false,
        initialData: () => {
            if (currentPageId && studyStep.root_page_info && studyStep.root_page_info.data.id === currentPageId) {
                return studyStep.root_page_info;
            }
            return undefined;
        }
    });

    console.log('SurveyPage Debug:', {
        studyStep,
        currentPageId,
        surveyPageWrapper,
        isLoading,
        error
    });

    useEffect(() => {
        if (!surveyPageWrapper) return;

        if (surveyPageWrapper.next_id) {
            setButtonControl({
                label: 'Continue',
                action: () => setCurrentPageId(surveyPageWrapper.next_id),
                isDisabled: !isPageComplete,
            });
        } else {
            if (isPageComplete) {
                resetNextButton();
                setIsStepComplete(true);
            }
        }
        return () => {
            resetNextButton();
        };
    }, [isPageComplete, setButtonControl, resetNextButton, surveyPageWrapper, setIsStepComplete]);

    if (!surveyPageWrapper) {
        return <LoadingScreen loading={true} message="Loading survey page..." />;
    }
    console.log('SurveyPage', surveyPageWrapper, isPageComplete);
    return (
        <div className="flex justify-content-evenly">
            <div className="">
                <SurveyTemplate surveyPage={surveyPageWrapper.data} />
            </div>
            <div className="content-center"></div>
        </div>
    );
};

export default SurveyPage;
