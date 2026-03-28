import { createContext } from 'react';

export interface StepCompletionContextType {
	isStepComplete: boolean;
	setIsStepComplete: (isComplete: boolean) => void;
}

export const StepCompletionContext = createContext<StepCompletionContextType | undefined>(undefined);
