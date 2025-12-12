import { useState, type ReactNode } from 'react';
import { StepCompletionContext } from '../hooks/useStepCompletion';

export const StepCompletionProvider = ({ children }: { children: ReactNode }) => {
    const [isStepComplete, setIsStepComplete] = useState(false);
    const value = { isStepComplete, setIsStepComplete };

    return <StepCompletionContext.Provider value={value}>{children}</StepCompletionContext.Provider>;
};
