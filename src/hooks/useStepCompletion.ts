import { useContext } from 'react';
import { StepCompletionContext } from '../providers/internal/StepCompletionInternal';

export const useStepCompletion = () => {
	const context = useContext(StepCompletionContext);
	if (context === undefined) {
		throw new Error('useStepCompletion must be used within a StepCompletionProvider');
	}
	return context;
};
