import { Button } from "@headlessui/react";
import { clsx } from "clsx";
import { useCallback, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import LoadingScreen from "../components/loadingscreen/LoadingScreen";
import { NextButtonControlProvider } from "../contexts/NextButtonControlProvider";
import { PageCompletionProvider } from "../contexts/pageCompletionContext";
import { StepCompletionProvider } from "../contexts/stepCompletionContext";
import { useNextButtonControl } from "../hooks/useNextButtonControl";
import { useStepCompletion } from "../hooks/useStepCompletion";
import type { StudyStep } from "../types/rssa.types";
import type { StudyLayoutContextType } from "../types/study.types";
import Footer from "./StudyFooter";
import Header from "./StudyHeader";

interface StudyLayoutProps {
	stepApiData: StudyStep | undefined;
}

const StudyLayoutContent: React.FC<StudyLayoutProps> = ({ stepApiData }) => {
	const navigate = useNavigate();
	const { isStepComplete, setIsStepComplete } = useStepCompletion();
	const { setButtonControl, buttonControl } = useNextButtonControl();

	const handleNextButtonClick = useCallback(() => {
		if (!stepApiData) return;
		navigate(stepApiData.next!);
		setIsStepComplete(false);
	}, [stepApiData, navigate, setIsStepComplete]);

	const handleNextButtonReset = useCallback(() => {
		setButtonControl({
			label: "Next",
			action: handleNextButtonClick,
			isDisabled: !isStepComplete,
		});
	}, [isStepComplete, setButtonControl, handleNextButtonClick]);

	const outletContextValue: StudyLayoutContextType = {
		studyStep: stepApiData!,
		resetNextButton: handleNextButtonReset,
	};

	useEffect(() => {
		setButtonControl({
			label: "Next",
			action: handleNextButtonClick,
			isDisabled: !isStepComplete,
		});
	}, [handleNextButtonClick, isStepComplete, setButtonControl]);

	if (!stepApiData) return <LoadingScreen loading={!stepApiData} message={"Study page is loading"} />;

	return (
		<div>
			<Header
				title={stepApiData?.title || stepApiData?.name || "Step missing title."}
				content={
					stepApiData?.instructions ||
					stepApiData?.description ||
					"Step is missing description or instructions."
				}
			/>
			<div className="mx-auto max-w-screen-xl px-2 rounded-md mb-24">
				<Outlet context={outletContextValue} />
				<nav className="p-4 bg-gray-200 flex justify-end">
					<Button
						as="button"
						onClick={buttonControl.action}
						disabled={buttonControl.isDisabled}
						className={clsx(
							"px-6 py-3 rounded-lg font-medium transition-colors duration-200",
							buttonControl.isDisabled
								? "bg-orange-300 cursor-not-allowed text-gray-400"
								: "bg-amber-500 hover:bg-amber-600 text-white cursor-pointer shadow-sm"
						)}
					>
						{buttonControl.label}
					</Button>
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
