import React, { type ReactNode } from 'react';
import { StudyUrlParamsContext, type StudyUrlParams } from './internal/StudyUrlParamsInternal';

export const StudyUrlParamsProvider: React.FC<{
	children: ReactNode;
	params: StudyUrlParams;
}> = ({ children, params }) => {
	return <StudyUrlParamsContext.Provider value={params}>{children}</StudyUrlParamsContext.Provider>;
};
