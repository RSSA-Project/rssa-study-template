import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePageCompletion } from '../../hooks/usePageCompletion';
import type { SurveyPageType } from '../../types/rssa.types';
import ContentBlock from './ContentBlock';

interface SurveyTemplateProps {
    surveyPage: SurveyPageType;
}

const SurveyTemplate: React.FC<SurveyTemplateProps> = ({ surveyPage }) => {
    const [completedContentIds, setCompletedContentIds] = useState<Set<string>>(new Set());
    const { setIsPageComplete } = usePageCompletion();

    const handelCompletion = useCallback((contentId: string) => {
        setCompletedContentIds((prev) => new Set(prev).add(contentId));
    }, []);

    const pageContents = useMemo(() => {
        if (!surveyPage.study_step_page_contents) return [];
        return surveyPage.study_step_page_contents;
    }, [surveyPage]);

    useEffect(() => {
        if (completedContentIds.size === pageContents.length) setIsPageComplete(true);
    });

    return (
        <>
            {pageContents.map((pageContent, index) => (
                <div key={pageContent.id + '_' + index}>
                    <p>{pageContent.preamble || ''}</p>
                    <ContentBlock content={pageContent} onComplete={handelCompletion} />
                </div>
            ))}
        </>
    );
};

export default SurveyTemplate;
