import { TelemetryProvider, useParticipant, useStudy, useStudyConfig, type StudyStepConfig } from '@rssa-project/api';
import { useIsRestoring, useQueryClient } from '@tanstack/react-query';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/loadingscreen/LoadingScreen';
import TestModeConfirmation from '../components/testmode/TestModeConfirmation';
import TestModeIndicator from '../components/testmode/TestModeIndicator';
import StudyLayout from '../layouts/StudyLayout';
import StudyExitPage from '../pages/StudyExitPage';
import { StudyUrlParamsProvider } from '../providers/StudyUrlParamsContext';
import type { NavigationWrapper, StudyParticipant, StudyStep } from '../types/rssa.types';
import usePersistentUrlParams from '../hooks/usePersistentUrlParams';

interface RouteWrapperProps {
	componentMap: { [key: string]: React.FC };
	WelcomePage?: React.FC<{
		isStudyReady: boolean;
		onStudyStart: () => void;
		studyId?: string;
		firstStepId?: string;
	}>;
}

const RouteWrapper: React.FC<RouteWrapperProps> = ({ componentMap, WelcomePage }) => {
	const location = useLocation();
	const navigate = useNavigate();
	const { studyApi } = useStudy();
	const { jwt } = useParticipant();
	const queryClient = useQueryClient();
	const isRestoring = useIsRestoring();

	const participantParams = usePersistentUrlParams();
	console.log(participantParams);
	const [loadedParticipant, setLoadedParticipant] = useState<StudyParticipant | null>(null);

	useEffect(() => {
		const fetchParticipant = async () => {
			if (!jwt) {
				setLoadedParticipant(null); // Reset if logged out
				return;
			}

			try {
				// participants/me endpoint requires authentication
				// Explicitly set the JWT on the client to avoid race conditions with Context updates
				studyApi.setJwt(jwt);
				const response = await studyApi.get<StudyParticipant>('participants/me');
				setLoadedParticipant(response);
			} catch (error) {
				console.error('Failed to fetch participant details:', error);
			}
		};
		fetchParticipant();
	}, [studyApi, jwt]);

	const [isTestModeConfirmed, setIsTestModeConfirmed] = useState(false);
	const [showExitPage, setShowExitPage] = useState(false);

	const isTestUser = participantParams.participantTypeKey === 'test';
	const shouldShowConfirmation = isTestUser && !isTestModeConfirmed && !showExitPage;

	useEffect(() => {
		if (loadedParticipant?.participant_type?.key === 'test') {
			setIsTestModeConfirmed(true);
		}
	}, [loadedParticipant]);

	const handleConfirmTestMode = () => {
		setIsTestModeConfirmed(true);
	};

	const handleCancelTestMode = () => {
		setShowExitPage(true);
	};

	const studyId = useMemo(() => studyApi.getStudyId(), [studyApi]);
	if (!studyId) {
		throw new Error('VITE_STUDY_ID is missing. Please ensure it is set in your environment file.');
	}
	const { data: config, isLoading } = useStudyConfig(studyId!);
	const [currentStepData, setCurrentStepData] = useState<StudyStep>();
	const loadStepData = useCallback(
		async (stepPath: string, configData: typeof config) => {
			if (!configData) return;

			const stepFromConfig = configData.steps.find((step: StudyStepConfig) => step.path === stepPath);
			if (stepFromConfig && stepFromConfig.step_id !== currentStepData?.id) {
				try {
					const response = await studyApi.get<NavigationWrapper<StudyStep>>(
						`steps/${stepFromConfig.step_id}`
					);
					const stepData = response.data || response;

					if (response.next_path) {
						stepData.next = response.next_path;
					}
					setCurrentStepData(stepData);
				} catch (error) {
					console.error('Failed to load step data:', error);
				}
			}
		},
		[studyApi, currentStepData]
	);

	useEffect(() => {
		if (location.pathname === '/welcome' && config) {
			queryClient.clear();
		}
		if (config && config.steps) {
			loadStepData(location.pathname, config);
		}
	}, [location.pathname, config, loadStepData, queryClient]);

	const handleStartStudy = async () => {
		if (!config?.study_id) return;

		try {
			const response = await studyApi.get<NavigationWrapper<StudyStep>>(`studies/${config.study_id}/steps/first`);
			const firstStep = response.data || response;

			if (firstStep) {
				if (response.next_path) {
					firstStep.next = response.next_path;
				}
				setCurrentStepData(firstStep);
				navigate(firstStep.path);
			}
		} catch (error) {
			console.error('Failed to start study:', error);
		}
	};
	const dynamicRoutes = useMemo(() => {
		if (!config?.steps) return null;

		return config.steps.map((step: StudyStepConfig) => {
			const { step_id, path, component_type } = step;

			const Component = componentMap[component_type];
			if (!Component) console.warn(`No component found for type: ${component_type}`);
			return Component ? <Route key={step_id} path={path} element={<Component />} /> : null;
		});
	}, [config?.steps, componentMap]);

	const contextParams = useMemo(() => {
		if (loadedParticipant?.participant_type?.key) {
			return {
				participantTypeKey: loadedParticipant.participant_type.key,
				externalId: loadedParticipant.external_id || 'N/A',
				isTestMode: loadedParticipant.participant_type.key === 'test' || isTestModeConfirmed,
			};
		}
		return {
			...participantParams,
			isTestMode: isTestModeConfirmed,
		};
	}, [loadedParticipant, participantParams, isTestModeConfirmed]);

	if (showExitPage) {
		return <StudyExitPage />;
	}

	if (isRestoring) {
		return <div className="p-8 font-semibold">Restoring session...</div>;
	}

	if (isLoading || !config) return <LoadingScreen loading={true} message={'Loading Study Configuration...'} />;

	return (
		<StudyUrlParamsProvider params={contextParams}>
			<TelemetryProvider apiClient={studyApi}>
				{isTestModeConfirmed && <TestModeIndicator studyStep={currentStepData} />}
				<TestModeConfirmation
					isOpen={shouldShowConfirmation}
					onConfirm={handleConfirmTestMode}
					onCancel={handleCancelTestMode}
				/>
				{!shouldShowConfirmation && (
					<Suspense fallback={<div className="p-8">Loading step component...</div>}>
						<Routes>
							{WelcomePage && (
								<Route
									path="/welcome"
									element={<WelcomePage isStudyReady={!isLoading} onStudyStart={handleStartStudy} />}
								/>
							)}
							<Route path="/" element={<Navigate to="/welcome" replace />} />
							<Route element={<StudyLayout stepApiData={currentStepData} />}>{dynamicRoutes}</Route>
						</Routes>
					</Suspense>
				)}
			</TelemetryProvider>
		</StudyUrlParamsProvider>
	);
};

export default RouteWrapper;
