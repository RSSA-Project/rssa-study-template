import { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { WarningDialog } from "./components/warningDialog";
import RouteWrapper from "./routes/RouteWrapper";
import "./App.css";
import { STRINGS } from "./utils/constants";

// Dummy component map for testing/development
const componentMap = {
	"WelcomeStep": () => <div>Welcome Step</div>,
	"ConsentStep": () => <div>Consent Step</div>,
	"SurveyStep": () => <div>Survey Step</div>,
	"CompletionStep": () => <div>Completion Step</div>,
};

function App() {
	const [showWarning, setShowWarning] = useState<boolean>(false);

	/*
	 * UseEffect to handle window resize events.
	 * Trigger conditions:
	 * 	- On component mount but sets a listener on window resize.
	 */
	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 1200) {
				setShowWarning(true);
			} else if (window.innerWidth >= 1200) {
				setShowWarning(false);
			}
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return (
		<div className="App">
			{showWarning && (
				<WarningDialog
					show={showWarning}
					onClose={setShowWarning}
					title="Warning"
					message={STRINGS.WINDOW_TOO_SMALL}
					disableHide={true}
				/>
			)}
			<Router basename="/preference-community/">
				<RouteWrapper componentMap={componentMap} />
			</Router>
		</div>
	);
}

export default App;
