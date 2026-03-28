import { useContext } from 'react';
import { PageCompletionContext } from '../providers/internal/PageCompletionInternal';

export const usePageCompletion = () => {
	const context = useContext(PageCompletionContext);
	if (context === undefined) {
		throw new Error('usePageCompletion must be used within a PageCompletionProvider');
	}
	return context;
};
