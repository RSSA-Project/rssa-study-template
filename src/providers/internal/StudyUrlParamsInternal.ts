import { createContext } from 'react';
type ParticipantSourceMeta = {
	[key: string]: string;
};
export interface StudyUrlParams {
	participantTypeKey: string;
	externalId: string;
	isTestMode: boolean;
	sourceMeta?: ParticipantSourceMeta;
}

export const StudyUrlParamsContext = createContext<StudyUrlParams | undefined>(undefined);
