import { createContext } from 'react';

export interface PageCompletionContextType {
	isPageComplete: boolean;
	setIsPageComplete: (isComplete: boolean) => void;
}

export const PageCompletionContext = createContext<PageCompletionContextType | undefined>(undefined);
