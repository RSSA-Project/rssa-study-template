import { useStudy } from '@rssa-project/api';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PageContent, SurveyConstructItem, SurveyItemResponse } from '../../types/rssa.types';
import ItemBlock from './ItemBlock';

interface ContentBlockProps {
	content: PageContent;
	onComplete: (contentId: string) => void;
}

const ContentBlock: React.FC<ContentBlockProps> = ({ content, onComplete }) => {
	const [answeredItemIds, setAnsweredItemIds] = useState<Set<string>>(new Set());
	const { studyApi } = useStudy();

	const { data: currentPageResponses } = useQuery({
		queryKey: ['currentPageResponses', content.study_step_page_id],
		queryFn: async () => studyApi.get<SurveyItemResponse[]>(`responses/survey/${content.study_step_page_id!}`),
		select: (data) => (Array.isArray(data) ? data : []),
		enabled: !!content.study_step_page_id,
		refetchOnWindowFocus: false,
	});

	const handleSelection = useCallback((itemId: string) => {
		setAnsweredItemIds((prev) => new Set(prev).add(itemId));
	}, []);

	const sortedItems = useMemo(() => {
		if (!content.items) return [];
		return [...content.items].sort((a, b) => a.order_position - b.order_position);
	}, [content]);

	useEffect(() => {
		if (answeredItemIds.size === content.items.length) {
			onComplete(content.id);
		}
	}, [answeredItemIds.size, content, onComplete]);

	return (
		<div>
			{sortedItems.map((item: SurveyConstructItem) => {
				const currentResponses = currentPageResponses?.find(
					(itemRes: SurveyItemResponse) => itemRes.item_id === item.id
				);
				return (
					<ItemBlock
						contextTag={content.display_name}
						pageId={content.study_step_page_id}
						key={item.id}
						item={item}
						initialResponse={currentResponses}
						scaleLevels={content.scale_levels}
						onSelected={handleSelection}
					/>
				);
			})}
		</div>
	);
};

export default ContentBlock;
