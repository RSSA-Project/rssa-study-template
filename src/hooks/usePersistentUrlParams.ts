import { useState, useEffect } from 'react';

type ParticipantSourceMeta = {
	[key: string]: string;
};
const usePersistentUrlParams = () => {
	const storageKey = 'rssa_participant_params';

	const [params, setParams] = useState(() => {
		const searchParams = new URLSearchParams(window.location.search);
		const hasParams = Array.from(searchParams.keys()).length > 0;

		let participantTypeKey = 'unknown';
		let externalId = 'N/A';
		const sourceMeta: Record<string, string> = {};

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
			return { participantTypeKey, externalId, sourceMeta, hasFreshParams: true };
		} else {
			const cached = sessionStorage.getItem(storageKey);
			if (cached) {
				try {
					const parsed = JSON.parse(cached);
					return { ...parsed, hasFreshParams: false };
				} catch (e) {
					console.error('Failed to parse cached session params', e);
				}
			}
		}

		return { participantTypeKey, externalId, sourceMeta, hasFreshParams: false };
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
	}, [params.hasFreshParams, params.participantTypeKey, params.externalId, params.sourceMeta]);

	return params;
};

export default usePersistentUrlParams;
