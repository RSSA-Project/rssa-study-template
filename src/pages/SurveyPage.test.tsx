import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SurveyPage from './SurveyPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NextButtonContext, defaultControl } from '../contexts/NextButtonContext';
import { PageCompletionContext } from '../hooks/usePageCompletion';
import { StepCompletionContext } from '../hooks/useStepCompletion';
import React from 'react';

// Mock rssa-api useStudy
const mockGet = vi.fn();
vi.mock('@rssa-project/api', () => ({
	useStudy: () => ({
		studyApi: {
			get: mockGet,
		},
	}),
}));

// Mock react-router-dom useOutletContext
const mockResetNextButton = vi.fn();
const mockStudyStep = {
	survey_api_root: 'page-1',
	root_page_info: null,
};

vi.mock('react-router-dom', () => ({
	useOutletContext: () => ({
		studyStep: mockStudyStep,
		resetNextButton: mockResetNextButton,
	}),
}));

// Mock child components to avoid complexity
vi.mock('../layouts/templates/SurveyTemplate', () => ({
	default: () => <div data-testid="survey-template">Survey Template Content</div>,
}));
vi.mock('../components/loadingscreen/LoadingScreen', () => ({
	default: ({ loading }: { loading: boolean }) => (loading ? <div data-testid="loading">Loading...</div> : null),
}));

const queryClient = new QueryClient({
	defaultOptions: { queries: { retry: false } },
});

const mockSetButtonControl = vi.fn();
const mockSetIsPageComplete = vi.fn();
const mockSetIsStepComplete = vi.fn();

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<QueryClientProvider client={queryClient}>
		<NextButtonContext.Provider
			value={{
				buttonControl: defaultControl,
				setButtonControl: mockSetButtonControl,
			}}
		>
			<PageCompletionContext.Provider
				value={{
					isPageComplete: false,
					setIsPageComplete: mockSetIsPageComplete,
				}}
			>
				<StepCompletionContext.Provider
					value={{
						isStepComplete: false,
						setIsStepComplete: mockSetIsStepComplete,
					}}
				>
					{children}
				</StepCompletionContext.Provider>
			</PageCompletionContext.Provider>
		</NextButtonContext.Provider>
	</QueryClientProvider>
);

describe('SurveyPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		queryClient.clear();
	});

	it('renders loading initially', () => {
		// Return a promise that never resolves immediately to test loading state logic if needed,
		// but SurveyPage logic depends on data being undefined initially.
		mockGet.mockReturnValue(new Promise(() => {}));
		render(<SurveyPage />, { wrapper });
		expect(screen.getByTestId('loading')).toBeInTheDocument();
	});

	it('renders survey template when data loads', async () => {
		const mockPageData = {
			data: { id: 'page-1', title: 'Test Page' },
			next_id: null,
		};
		mockGet.mockResolvedValue(mockPageData);

		render(<SurveyPage />, { wrapper });

		await waitFor(() => expect(screen.getByTestId('survey-template')).toBeInTheDocument());
		expect(mockGet).toHaveBeenCalledWith('pages/page-1');
	});

	it('sets button control when next_id exists', async () => {
		const mockPageData = {
			data: { id: 'page-1' },
			next_id: 'page-2',
		};
		mockGet.mockResolvedValue(mockPageData);

		render(<SurveyPage />, { wrapper });

		await waitFor(() => expect(screen.getByTestId('survey-template')).toBeInTheDocument());

		expect(mockSetButtonControl).toHaveBeenCalledWith(
			expect.objectContaining({
				label: 'Continue',
				isDisabled: true, // isPageComplete is false in wrapper
			})
		);
	});
});
