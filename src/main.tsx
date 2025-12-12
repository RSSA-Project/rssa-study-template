import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import React from "react";
import ReactDOM from "react-dom/client";
import { ParticipantProvider, StudyProvider } from "rssa-api";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";

const RSSA_API_DEV = import.meta.env.VITE_RSSA_API_DEV!;
const RSSA_API = import.meta.env.VITE_RSSA_API!;
const RSSA_STUDY_ID = import.meta.env.VITE_RSSA_STUDY_ID!;
const RSSA_API_KEY_ID = import.meta.env.VITE_RSSA_API_KEY_ID;
const RSSA_API_KEY_SECRET = import.meta.env.VITE_RSSA_API_KEY_SECRET;

if (import.meta.hot) {
	import.meta.hot.on("vite:error", ({ err }) => {
		const hookErrorMessages = [
			"rendered fewer hooks than expected",
			"rendered more hooks than expected",
			"hook queue mismatch",
		];

		const isHookError = hookErrorMessages.some((msg) => err.message.toLowerCase().includes(msg));

		if (isHookError) {
			console.warn("React hook mismatch detected during HMR. Forcing a full page reload.");
			location.reload();
		}
	});
}

const api_url_base = import.meta.env.DEV ? RSSA_API_DEV : RSSA_API;
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5 minutes
			gcTime: 1000 * 60 * 60 * 24, // 24 hours
		},
	},
});

const localStoragePersister = createAsyncStoragePersister({
	storage: {
		getItem: (key) => Promise.resolve(localStorage.getItem(key)),
		setItem: (key, value) => Promise.resolve(localStorage.setItem(key, value)),
		removeItem: (key) => Promise.resolve(localStorage.removeItem(key)),
	},
});
const providerConfig = {
	apiUrlBase: api_url_base,
	studyId: RSSA_STUDY_ID,
	apiKeyId: RSSA_API_KEY_ID,
	apiKeySecret: RSSA_API_KEY_SECRET,
};

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<PersistQueryClientProvider client={queryClient} persistOptions={{ persister: localStoragePersister }}>
			<ParticipantProvider>
				<StudyProvider config={providerConfig}>
					<ErrorBoundary>
						<App />
					</ErrorBoundary>
					<ReactQueryDevtools initialIsOpen={false} />
				</StudyProvider>
			</ParticipantProvider>
		</PersistQueryClientProvider>
	</React.StrictMode>
);
