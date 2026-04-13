import { useParticipant, type RssaClient, type StudyConfig } from '@rssa-project/api'; // Or your internal import
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { StudyParticipant } from '../types/rssa.types';

interface InitializationProps {
	studyId?: string;
	config?: StudyConfig;
	studyApi: RssaClient;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	participantParams: any;
}

export const useStudyInitialization = ({ studyId, config, studyApi, participantParams }: InitializationProps) => {
	const location = useLocation();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { jwt } = useParticipant();

	const [isInitializing, setIsInitializing] = useState(true);
	const [loadedParticipant, setLoadedParticipant] = useState<StudyParticipant | null>(null);
	const initializationLock = useRef(false);

	useEffect(() => {
		if (!config || !studyId || initializationLock.current) return;
		initializationLock.current = true;

		const isEntryPoint = location.pathname === '/' || location.pathname === '/welcome';
		const hasQueryParams = location.search.length > 0;
		const isRefreshRequest = new URLSearchParams(location.search).get('refresh') === 'true';

		const performWipe = (preserveParams: boolean = false) => {
			const paramsKey = `${studyId}_participant_params`;
			[localStorage, sessionStorage].forEach((storage) => {
				Object.keys(storage).forEach((key) => {
					if (key.includes(studyId)) {
						if (preserveParams && key === paramsKey) return;
						storage.removeItem(key);
					}
				});
			});
			queryClient.clear();
			studyApi.setJwt(null);
			setLoadedParticipant(null);
			studyApi.setJwt(null);
		};

		if (
			isRefreshRequest ||
			(isEntryPoint && !hasQueryParams && !sessionStorage.getItem(`${studyId}_participant_params`))
		) {
			performWipe(false);
			setIsInitializing(false);
			return;
		}

		if (participantParams.didReset) {
			performWipe(true);
			setIsInitializing(false);
			return;
		}

		const fetchParticipantAndResume = async () => {
			if (!jwt) {
				setIsInitializing(false);
				return;
			}

			try {
				const response = await studyApi.get<StudyParticipant>('participants/me');
				setLoadedParticipant(response);

				if (isEntryPoint && response.current_step_id) {
					const stepConfig = config.steps.find((s) => s.step_id === response.current_step_id);
					if (stepConfig) {
						navigate(stepConfig.path, { replace: true });
					}
				}
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} catch (error: any) {
				console.error('Failed to fetch participant details:', error);
				const statusCode = error?.status || error?.response?.status;
				if (statusCode === 401 || statusCode === 403) {
					performWipe(false);
					window.dispatchEvent(new Event('rssa-unauthorized'));
				}
			} finally {
				setIsInitializing(false);
			}
		};

		fetchParticipantAndResume();
	}, [
		studyId,
		config,
		location.pathname,
		location.search,
		jwt,
		navigate,
		queryClient,
		studyApi,
		participantParams.didReset,
	]);

	return { isInitializing, loadedParticipant };
};
