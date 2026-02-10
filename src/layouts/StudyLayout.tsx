import { useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/loadingscreen/LoadingScreen';
import NextButton from '../components/NextButton';
import { NextButtonControlProvider } from '../contexts/NextButtonControlProvider';
import { PageCompletionProvider } from '../contexts/pageCompletionContext';
import { StepCompletionProvider } from '../contexts/stepCompletionContext';
import { useNextButtonControl } from '../hooks/useNextButtonControl';
import { useStepCompletion } from '../hooks/useStepCompletion';
import type { StudyStep } from '../types/rssa.types';
import type { StudyLayoutContextType } from '../types/study.types';
import Footer from './StudyFooter';
import Header from './StudyHeader';

interface StudyLayoutProps {
	stepApiData: StudyStep | undefined;
}

const StudyLayoutContent: React.FC<StudyLayoutProps> = ({ stepApiData }) => {
	const navigate = useNavigate();
	const [buttonLoader, setButtonLoader] = useState<boolean>(false);
	const { isStepComplete, setIsStepComplete } = useStepCompletion();
	const { setButtonControl, buttonControl } = useNextButtonControl();

	const handleButtonLoaderState = useCallback(
		(showLoader: boolean) => setButtonLoader(showLoader),
		[setButtonLoader]
	);

	const handleNextButtonClick = useCallback(() => {
		if (!stepApiData) return;
		navigate(stepApiData.next!);
		setIsStepComplete(false);
	}, [stepApiData, navigate, setIsStepComplete]);

	const handleNextButtonReset = useCallback(() => {
		setButtonControl({
			label: 'Next',
			action: handleNextButtonClick,
			isDisabled: !isStepComplete,
		});
	}, [isStepComplete, setButtonControl, handleNextButtonClick]);

	const outletContextValue: StudyLayoutContextType = useMemo(
		() => ({
			studyStep: stepApiData!,
			resetNextButton: handleNextButtonReset,
			showButtonLoader: handleButtonLoaderState,
		}),
		[stepApiData, handleNextButtonReset, handleButtonLoaderState]
	);

	useEffect(() => {
		setButtonControl({
			label: 'Next',
			action: handleNextButtonClick,
			isDisabled: !isStepComplete,
		});
	}, [handleNextButtonClick, isStepComplete, setButtonControl]);

	if (!stepApiData) return <LoadingScreen loading={!stepApiData} message={'Study page is loading'} />;

	return (
		<div>
			<Header
				title={stepApiData?.title || stepApiData?.name || 'Step missing title.'}
				content={
					stepApiData?.instructions ||
					stepApiData?.description ||
					'Step is missing description or instructions.'
				}
			/>
			<div className="mx-auto px-2 rounded-md mb-24">
				<Outlet context={outletContextValue} />
				<nav className="p-4 bg-gray-200 flex justify-end mt-3">
					<NextButton
						handleClick={buttonControl.action}
						disabled={buttonControl.isDisabled}
						loading={buttonLoader}
					>
						{buttonControl.label}
					</NextButton>

					{/* <Button
						as="button"
						onClick={buttonControl.action}
						disabled={buttonControl.isDisabled}
						className={clsx(
							'px-6 py-3 rounded-lg font-medium transition-colors duration-200',
							buttonControl.isDisabled
								? 'bg-orange-300 cursor-not-allowed text-gray-400'
								: 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer shadow-sm'
						)}
					> */}
					{/* {buttonControl.label} */}
					{/* <div className="inset-0 opacity-100 z-50 rounded-b-md flex items-center justify-center">
							<svg
								className="animate-spin h-6 w-6 text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
						</div>
					</Button> */}
				</nav>
			</div>
			<Footer />
		</div>
	);
};

const StudyLayout = ({ stepApiData }: StudyLayoutProps) => {
	return (
		<StepCompletionProvider>
			<PageCompletionProvider>
				<NextButtonControlProvider>
					<StudyLayoutContent stepApiData={stepApiData} />
				</NextButtonControlProvider>
			</PageCompletionProvider>
		</StepCompletionProvider>
	);
};

export default StudyLayout;
