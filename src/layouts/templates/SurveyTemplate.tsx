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

	const handelCompletion = useCallback(
		(contentId: string) => {
			setCompletedContentIds((prev) => new Set(prev).add(contentId));
		},
		[setCompletedContentIds]
	);

	const pageContents = useMemo(() => {
		if (!surveyPage.study_step_page_contents) return [];
		setCompletedContentIds(new Set());
		return surveyPage.study_step_page_contents;
	}, [surveyPage]);

	useEffect(() => {
		if (completedContentIds.size === pageContents.length) setIsPageComplete(true);
		else setIsPageComplete(false);
	}, [completedContentIds, pageContents, setIsPageComplete]);

	return (
		<>
			{pageContents.map((pageContent, index) => (
				<div key={pageContent.id + '_' + index}>
					{pageContent.preamble && <p>{pageContent.preamble}</p>}
					<ContentBlock content={pageContent} onComplete={handelCompletion} />
				</div>
			))}
		</>
	);
};

export default SurveyTemplate;
