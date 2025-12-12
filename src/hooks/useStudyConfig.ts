import { useQuery } from "@tanstack/react-query";
import { useStudy } from "rssa-api";
import { RETRY_DELAYS_MS } from "../constants";

export interface StudyConditionConfig {
	[key: string]: string;
}
export interface StudyStepConfig {
	step_id: string;
	path: string;
	component_type: string;
}

export interface StudyConfig {
	study_id: string;
	conditions: StudyConditionConfig;
	steps: StudyStepConfig[];
}

export const useStudyConfig = (studyId: string) => {
	const { studyApi } = useStudy();

	return useQuery<StudyConfig>({
		queryKey: ["studyConfig", studyId],
		queryFn: () => studyApi.get<StudyConfig>(`studies/${studyId}/config`),
		enabled: !!studyId,
		retry: RETRY_DELAYS_MS.length,
		retryDelay: (attemptIndex) => RETRY_DELAYS_MS[attemptIndex],
		refetchOnWindowFocus: false,
		staleTime: Infinity,
		gcTime: 1000 * 60 * 60 * 24, // 24 hours
	});
};
