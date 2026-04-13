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
		const contents = surveyPage.study_step_page_contents || [];

		return [...contents].sort((a, b) => a.order_position - b.order_position);
	}, [surveyPage.study_step_page_contents]);

	useEffect(() => {
		if (pageContents.length > 0 && completedContentIds.size === pageContents.length) {
			setIsPageComplete(true);
		} else {
			setIsPageComplete(false);
		}
	}, [completedContentIds.size, pageContents.length, setIsPageComplete]);

	useEffect(() => {
		return () => setIsPageComplete(false);
	}, [setIsPageComplete]);

	return (
		<>
			{pageContents.map((pageContent) => (
				<div key={pageContent.id}>
					{pageContent.preamble && <p>{pageContent.preamble}</p>}
					<ContentBlock content={pageContent} onComplete={handelCompletion} />
				</div>
			))}
		</>
	);
};

export default SurveyTemplate;
