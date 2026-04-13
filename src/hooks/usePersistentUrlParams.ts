import { useEffect, useState } from 'react';

type ParticipantSourceMeta = {
	[key: string]: string;
};

const usePersistentUrlParams = (studyId: string) => {
	const storageKey = `${studyId}_participant_params`;

	const [params, setParams] = useState(() => {
		const searchParams = new URLSearchParams(window.location.search);
		const hasParams = Array.from(searchParams.keys()).length > 0;
		const isRefreshRequest = searchParams.get('refresh') === 'true';

		let participantTypeKey = 'unknown';
		let externalId = 'N/A';
		const sourceMeta: Record<string, string> = {};

		if (isRefreshRequest) {
			sessionStorage.removeItem(storageKey);
			return { participantTypeKey, externalId, sourceMeta, hasFreshParams: false, didReset: true };
		}

		if (hasParams) {
			for (const [key, value] of searchParams.entries()) {
				sourceMeta[key] = value;
				if (key.endsWith('_pid')) {
					const typePrefix = key.split('_pid')[0];
					if (typePrefix) {
						participantTypeKey = typePrefix;
						externalId = value;
					}
				}
			}

			const stringifiedNewMeta = JSON.stringify(sourceMeta);
			let isNewUser = true;

			const cached = sessionStorage.getItem(storageKey);
			if (cached) {
				try {
					const parsed = JSON.parse(cached);
					// If the incoming params exactly match the cached ones, do not reset!
					if (JSON.stringify(parsed.sourceMeta) === stringifiedNewMeta) {
						isNewUser = false;
					}
				} catch (e) {
					console.error('Failed to parse cached session params', e);
				}
			}

			return { participantTypeKey, externalId, sourceMeta, hasFreshParams: true, didReset: isNewUser };
		}

		const cached = sessionStorage.getItem(storageKey);
		if (cached) {
			try {
				const parsed = JSON.parse(cached);
				return { ...parsed, hasFreshParams: false, didReset: false };
			} catch (e) {
				console.error('Failed to parse cached session params', e);
			}
		}

		return { participantTypeKey, externalId, sourceMeta, hasFreshParams: false, didReset: false };
	});

	useEffect(() => {
		if (params.hasFreshParams) {
			sessionStorage.setItem(
				storageKey,
				JSON.stringify({
					participantTypeKey: params.participantTypeKey,
					externalId: params.externalId,
					sourceMeta: params.sourceMeta,
				})
			);

			window.history.replaceState({}, document.title, window.location.pathname);
			setParams((prev: ParticipantSourceMeta) => ({ ...prev, hasFreshParams: false }));
		}
	}, [params.hasFreshParams, params.participantTypeKey, params.externalId, params.sourceMeta, storageKey]);

	return params;
};

export default usePersistentUrlParams;
