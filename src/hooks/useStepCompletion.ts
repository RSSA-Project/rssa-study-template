import { createContext, useContext } from 'react';

interface StepCompletionContextType {
    isStepComplete: boolean;
    setIsStepComplete: (isComplete: boolean) => void;
}

export const StepCompletionContext = createContext<StepCompletionContextType | undefined>(undefined);

export const useStepCompletion = () => {
    const context = useContext(StepCompletionContext);
    if (context === undefined) {
        throw new Error('useStepCompletion must be used within a StepCompletionProvider');
    }
    return context;
};
