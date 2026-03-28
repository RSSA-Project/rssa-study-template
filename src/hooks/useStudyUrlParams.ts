import { useContext } from 'react';
import { StudyUrlParamsContext, type StudyUrlParams } from '../providers/internal/StudyUrlParamsInternal';

export const useStudyUrlParams = (): StudyUrlParams => {
	const context = useContext(StudyUrlParamsContext);
	if (context === undefined) {
		throw new Error('useStudyUrlParams must be used within a StudyUrlParamsProvider');
	}
	return context;
};
