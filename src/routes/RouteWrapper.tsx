import { useIsRestoring, useQueryClient } from "@tanstack/react-query";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  useStudy,
  useStudyConfig,
  useParticipant,
  type StudyStepConfig,
} from "rssa-api";
import StudyLayout from "../layouts/StudyLayout";
import LoadingScreen from "../components/loadingscreen/LoadingScreen";
import type { StudyStep } from "../types/rssa.types";
import { StudyUrlParamsProvider } from "../contexts/StudyUrlParamsContext";
import TestModeConfirmation from "../components/TestModeConfirmation";
import StudyExitPage from "../pages/StudyExitPage";
import TestModeIndicator from "../components/TestModeIndicator";

interface RouteWrapperProps {
  componentMap: { [key: string]: React.FC };
  WelcomePage?: React.FC<{
    isStudyReady: boolean;
    onStudyStart: () => void;
    studyId?: string;
    firstStepId?: string;
  }>;
}

const RouteWrapper: React.FC<RouteWrapperProps> = ({
  componentMap,
  WelcomePage,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { studyApi } = useStudy();
  const { jwt } = useParticipant(); // Access JWT to react to authentication changes
  const queryClient = useQueryClient();
  const isRestoring = useIsRestoring();

  const [loadedParticipant, setLoadedParticipant] = useState<any>(null);

  useEffect(() => {
    const fetchParticipant = async () => {
      // Avoid fetching if no JWT is present (unless we want to fail fast)
      if (!jwt) {
        setLoadedParticipant(null); // Reset if logged out
        return;
      }

      try {
        // participants/me endpoint requires authentication
        // Explicitly set the JWT on the client to avoid race conditions with Context updates
        studyApi.setJwt(jwt);
        const response = await studyApi.get<any>("participants/me");
        setLoadedParticipant(response.data || response);
      } catch (error) {
        // Silent failure if not authenticated or not found
        console.error("Failed to fetch participant details:", error);
      }
    };
    fetchParticipant();
  }, [studyApi, jwt]); // Re-run when JWT changes (e.g. after consent/enrollment)

  // State for Test Mode flow
  const [isTestModeConfirmed, setIsTestModeConfirmed] = useState(false);
  const [showExitPage, setShowExitPage] = useState(false);

  // Parse URL parameters for participant details only once on mount
  const [participantParams] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    let participantTypeKey = "unknown";
    let externalId = "N/A";

    for (const [key, value] of searchParams.entries()) {
      if (key.endsWith("_pid")) {
        const typePrefix = key.split("_pid")[0];
        if (typePrefix) {
          participantTypeKey = typePrefix;
          externalId = value;
          break; // Use the first match
        }
      }
    }

    return { participantTypeKey, externalId };
  });

  const isTestUser = participantParams.participantTypeKey === "test";
  const shouldShowConfirmation =
    isTestUser && !isTestModeConfirmed && !showExitPage;

  // Persist Test Mode if the loaded participant is a test user
  useEffect(() => {
    if (loadedParticipant?.participant_type?.key === "test") {
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
    throw new Error(
      "VITE_STUDY_ID is missing. Please ensure it is set in your environment file.",
    );
  }
  const { data: config, isLoading } = useStudyConfig(studyId!);
  const [currentStepData, setCurrentStepData] = useState<StudyStep>();
  const loadStepData = useCallback(
    async (stepPath: string, configData: typeof config) => {
      if (!configData) return;

      const stepFromConfig = configData.steps.find(
        (step: StudyStepConfig) => step.path === stepPath,
      );

      if (stepFromConfig && stepFromConfig.step_id !== currentStepData?.id) {
        try {
          const response = await studyApi.get<any>(
            `steps/${stepFromConfig.step_id}`,
          );
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
    [studyApi, currentStepData],
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
      const response = await studyApi.get<any>(
        `studies/${config.study_id}/steps/first`,
      );
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

    return config.steps.map((step: StudyStepConfig) => {
      const { step_id, path, component_type } = step;

      const Component = componentMap[component_type];
      if (!Component)
        console.warn(`No component found for type: ${component_type}`);
      return Component ? (
        <Route key={step_id} path={path} element={<Component />} />
      ) : null;
    });
  }, [config?.steps, componentMap]);

  // Context params: Priority to loaded participant, fallback to URL params
  const contextParams = useMemo(() => {
    if (loadedParticipant?.participant_type?.key) {
      return {
        participantTypeKey: loadedParticipant.participant_type.key,
        externalId: loadedParticipant.external_id || "N/A",
        isTestMode:
          loadedParticipant.participant_type.key === "test" ||
          isTestModeConfirmed,
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

  if (isLoading || !config)
    return (
      <LoadingScreen
        loading={true}
        message={"Loading Study Configuration..."}
      />
    );

  return (
    <StudyUrlParamsProvider params={contextParams}>
      {isTestModeConfirmed && <TestModeIndicator studyStep={currentStepData} />}
      <TestModeConfirmation
        isOpen={shouldShowConfirmation}
        onConfirm={handleConfirmTestMode}
        onCancel={handleCancelTestMode}
      />
      {/* 
        We only render the main routes if we are NOT waiting for confirmation.
        However, blocking rendering might cause issues if hooks depend on it.
        Better to render but maybe overlay the modal.
        Since we return the modal above, and isOpen controls visibility, 
        we can proceed to render the app behind it (or block it).
        Given the requirement "intercept... before entering", blocking is safer 
        to prevent any auto-initialization effects.
       */}
      {!shouldShowConfirmation && (
        <Suspense
          fallback={<div className="p-8">Loading step component...</div>}
        >
          <Routes>
            {WelcomePage && (
              <Route
                path="/welcome"
                element={
                  <WelcomePage
                    isStudyReady={!isLoading}
                    onStudyStart={handleStartStudy}
                  />
                }
              />
            )}
            <Route path="/" element={<Navigate to="/welcome" replace />} />
            <Route element={<StudyLayout stepApiData={currentStepData} />}>
              {dynamicRoutes}
            </Route>
          </Routes>
        </Suspense>
      )}
    </StudyUrlParamsProvider>
  );
};

export default RouteWrapper;
