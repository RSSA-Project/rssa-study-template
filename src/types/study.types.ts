import type { StudyStep, SurveyConstructItem, SurveyItemResponse, ScaleLevel } from './rssa.types';

export type StudyLayoutContextType = {
	studyStep: StudyStep;
	resetNextButton: () => void;
	showButtonLoader: (showLoader: boolean) => void;
};

export interface ItemBlockProps {
	contextTag: string;
	pageId: string;
	item: SurveyConstructItem;
	initialResponse: SurveyItemResponse | undefined;
	scaleLevels: ScaleLevel[];
	onSelected: (itemId: string) => void;
}

export interface AttentionCheckResponse {
	id: string;
	survey_scale_level_id: string;
	version?: number;
}

export interface AttentionItemBlockProps {
	contextTag: string;
	pageId: string;
	item: SurveyConstructItem;
	initialResponse: SurveyItemResponse | undefined;
	scaleLevels: ScaleLevel[];
}
