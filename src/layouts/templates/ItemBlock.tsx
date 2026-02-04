import { Label, Radio, RadioGroup } from '@headlessui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';
import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useStudy } from '@rssa-project/api';
import { useDebounce } from '../../hooks/useDebounce';
import type { ScaleLevel, SurveyConstructItem, SurveyItemResponse } from '../../types/rssa.types';
import type { StudyLayoutContextType } from '../../types/study.types';

interface ItemBlockProps {
	contextTag: string;
	pageId: string;
	item: SurveyConstructItem;
	initialResponse: SurveyItemResponse | undefined;
	scaleLevels: ScaleLevel[];
	onSelected: (itemId: string) => void;
}

interface ItemResponsePayload {
	study_step_id: string;
	study_step_page_id: string;
	survey_item_id: string;
	survey_construct_id: string;
	survey_scale_id: string;
	survey_scale_level_id: string;
	context_tag: string;
	version?: number;
	id?: string;
}

interface ItemResponsePatchPayload extends ItemResponsePayload {
	id: string;
	version: number;
}

interface MutationResult {
	type: 'POST' | 'PATCH';
	id: string;
	item_id: string;
	scale_level_id: string;
	version: number;
}

const ItemBlock: React.FC<ItemBlockProps> = ({
	contextTag,
	pageId,
	item,
	initialResponse,
	scaleLevels,
	onSelected,
}) => {
	const { studyStep } = useOutletContext<StudyLayoutContextType>();
	const initialSelection = initialResponse?.survey_scale_level_id || '';
	const [selectedValue, setSelectedValue] = useState<string>(initialSelection);
	const [previousValue, setPreviousValue] = useState<string>(initialSelection);
	const { studyApi } = useStudy();
	useEffect(() => {
		if (initialResponse) {
			setSelectedValue(initialResponse.survey_scale_level_id || '');
			setPreviousValue(initialResponse.survey_scale_level_id || '');
			if (initialResponse.survey_scale_level_id) onSelected(item.id);
		}
	}, [initialResponse, item.id, onSelected]);
	const scaleLevelsSorted = useMemo(() => {
		return scaleLevels.sort((a, b) => a.order_position - b.order_position);
	}, [scaleLevels]);

	const debouncedValue = useDebounce(selectedValue, 500);
	const queryClient = useQueryClient();
	const responseUpsertMutation = useMutation({
		mutationKey: ['currentPageResponses', pageId],
		mutationFn: async (newScaleLevel: string): Promise<MutationResult> => {
			if (initialResponse && initialResponse.id) {
				const patchPayload: ItemResponsePatchPayload = {
					study_step_id: studyStep.id,
					study_step_page_id: pageId,
					survey_construct_id: item.survey_construct_id,
					survey_scale_id: scaleLevels[0].survey_scale_id,
					context_tag: contextTag,
					survey_item_id: item.id,
					survey_scale_level_id: newScaleLevel,
					id: initialResponse.id,
					version: initialResponse.version!, // Use version from the initial response
				};

				await studyApi.patch<ItemResponsePatchPayload, void>(
					`responses/survey/${initialResponse.id}`,
					patchPayload
				);

				return {
					type: 'PATCH',
					id: initialResponse.id,
					item_id: initialResponse.survey_item_id,
					scale_level_id: newScaleLevel,
					version: initialResponse.version! + 1,
				};
			} else {
				const postPayload: ItemResponsePayload = {
					study_step_id: studyStep.id,
					study_step_page_id: pageId,
					survey_construct_id: item.survey_construct_id,
					survey_scale_id: scaleLevels[0].survey_scale_id,
					context_tag: contextTag,
					survey_item_id: item.id,
					survey_scale_level_id: newScaleLevel,
				};
				const response = await studyApi.post<ItemResponsePayload, SurveyItemResponse>(
					'responses/survey/',
					postPayload
				);

				return {
					type: 'POST',
					id: response.id,
					item_id: item.id,
					scale_level_id: response.survey_scale_level_id,
					version: response.version || 1,
				};
			}
		},
		onSuccess: (result) => {
			queryClient.setQueryData<SurveyItemResponse[]>(['currentPageResponses', pageId], (oldResponses) => {
				const existingResponses = oldResponses || [];
				const newResponse: SurveyItemResponse = {
					id: result.id,
					survey_item_id: result.item_id,
					survey_scale_level_id: result.scale_level_id,
					version: result.version,
				};

				const index = existingResponses.findIndex((res) => res.survey_item_id === result.item_id);

				if (index > -1) {
					return existingResponses.map((res, i) => (i === index ? newResponse : res));
				} else {
					return [...existingResponses, newResponse];
				}
			});
			onSelected(item.id);
		},

		onError: () => {
			console.error(`Failed to save response for item ${item.id}. Rolling back selection.`);
			setSelectedValue(previousValue);
		},
	});

	useEffect(() => {
		if (debouncedValue !== '' && debouncedValue !== previousValue) {
			responseUpsertMutation.mutateAsync(debouncedValue);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedValue, responseUpsertMutation.mutateAsync, previousValue]);

	const parseHTML = (htmlstr: string) => {
		const clean = DOMPurify.sanitize(htmlstr);
		const parsed = parse(clean);
		return parsed;
	};

	const handleRadioChange = (value: string) => {
		setPreviousValue(selectedValue);
		setSelectedValue(value);
	};

	return (
		<RadioGroup
			value={selectedValue}
			onChange={handleRadioChange}
			className="my-1 py-1 bg-gray-50 rounded-md"
			disabled={responseUpsertMutation.isPending}
		>
			<Label className="text-left p-3 text-base font-normal">{parseHTML(item.display_name)}</Label>
			<div className="m-2 p-2 flex items-center gap-2">
				{scaleLevelsSorted.map((level) => (
					<Radio
						key={level.id}
						value={level.id.toString()}
						className={({ focus, checked }) =>
							clsx(
								'cursor-pointer rounded-md p-2 border text-sm content-center justify-items-center',
								'hover:bg-amber-400 hover:text-gray-700',
								focus && 'ring-2 ring-yellow-400 ring-offset-2',
								checked
									? 'border-amber-400 bg-amber-400 text-gray-700'
									: 'border-slate-200 bg-slate-200 text-gray-700'
							)
						}
					>
						<Label>{level.display_name}</Label>
					</Radio>
				))}
			</div>
		</RadioGroup>
	);
};

export default ItemBlock;
