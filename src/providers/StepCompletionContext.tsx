import { useState, type ReactNode } from 'react';
import { StepCompletionContext } from './internal/StepCompletionInternal';

export const StepCompletionProvider = ({ children }: { children: ReactNode }) => {
	const [isStepComplete, setIsStepComplete] = useState(false);
	const value = { isStepComplete, setIsStepComplete };

	return <StepCompletionContext.Provider value={value}>{children}</StepCompletionContext.Provider>;
};
