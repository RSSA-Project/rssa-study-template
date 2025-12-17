import { useIsRestoring, useQueryClient } from "@tanstack/react-query";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useStudy } from "rssa-api";
import { useStudyConfig } from "../hooks/useStudyConfig";
import StudyLayout from "../layouts/StudyLayout";
import LoadingScreen from "../components/loadingscreen/LoadingScreen";
import type { StudyStep } from "../types/rssa.types";

interface RouteWrapperProps {
	componentMap: { [key: string]: React.FC };
	WelcomePage?: React.FC<{ isStudyReady: boolean; onStudyStart: () => void; studyId?: string; firstStepId?: string }>;
}

const RouteWrapper: React.FC<RouteWrapperProps> = ({ componentMap, WelcomePage }) => {
	const location = useLocation();
	const navigate = useNavigate();
	const { studyApi } = useStudy();
	const queryClient = useQueryClient();
	const isRestoring = useIsRestoring();

	const studyId = useMemo(() => studyApi.getStudyId(), [studyApi]);
	if (!studyId) {
		throw new Error("VITE_STUDY_ID is missing. Please ensure it is set in your environment file.");
	}
	const { data: config, isLoading, error } = useStudyConfig(studyId!);
	const [currentStepData, setCurrentStepData] = useState<StudyStep>();
	const loadStepData = useCallback(
		async (stepPath: string, configData: typeof config) => {
			if (!configData) return;

			const stepFromConfig = configData.steps.find((step) => step.path === stepPath);

			if (stepFromConfig && stepFromConfig.step_id !== currentStepData?.id) {
				try {
					const response = await studyApi.get<any>(`steps/${stepFromConfig.step_id}`);
					const stepData = response.data || response;

					if (response.next_path) {
						stepData.next = response.next_path;
					}

					setCurrentStepData(stepData);
				} catch (error) {
					console.error("Failed to load step data:", error);
				}
			}
		},
		[studyApi, currentStepData]
	);

	useEffect(() => {
		if (location.pathname === "/welcome" && config) {
			queryClient.clear();
		}
		if (config && config.steps) {
			loadStepData(location.pathname, config);
		}
	}, [location.pathname, config, loadStepData, queryClient]);

	const handleStartStudy = async () => {
		if (!config?.study_id) return;

		try {
			const response = await studyApi.get<any>(`studies/${config.study_id}/steps/first`);
			const firstStep = response.data || response;

			if (firstStep) {
				if (response.next_path) {
					firstStep.next = response.next_path;
				}
				setCurrentStepData(firstStep);
				navigate(firstStep.path);
			}
		} catch (error) {
			console.error("Failed to start study:", error);
		}
	};
	const dynamicRoutes = useMemo(() => {
		if (!config?.steps) return null;

		return config.steps.map(({ step_id, path, component_type }) => {
			const Component = componentMap[component_type];
			if (!Component) console.warn(`No component found for type: ${component_type}`);
			return Component ? <Route key={step_id} path={path} element={<Component />} /> : null;
		});
	}, [config?.steps, componentMap]);

	if (isRestoring) {
		return <div className="p-8 font-semibold">Restoring session...</div>;
	}

	if (isLoading || !config) return <LoadingScreen loading={true} message={"Loading Study Configuration..."} />;

	return (
		<Suspense fallback={<div className="p-8">Loading step component...</div>}>
			<Routes>
				{WelcomePage && (
					<Route
						path="/welcome"
						element={<WelcomePage isStudyReady={!isLoading} onStudyStart={handleStartStudy} />}
					/>
				)}
				<Route path="/" element={<Navigate to="/welcome" replace />} />
				<Route element={<StudyLayout stepApiData={currentStepData} />}>
					{dynamicRoutes}
				</Route>
			</Routes>
		</Suspense>
	);
};

export default RouteWrapper;
