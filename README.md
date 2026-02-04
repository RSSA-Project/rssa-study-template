# RSSA Study Template (@rssa-project/study-template)

[![npm version](https://img.shields.io/npm/v/@rssa-project/study-template.svg)](https://www.npmjs.com/package/@rssa-project/study-template)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A React component library providing standard layouts, pages, and hooks for building research studies on the RSSA Platform. It creates a consistent UI and logic flow (consent -> survey -> stimuli -> feedback) across different RSSA studies.

## Installation

```bash
npm install @rssa-project/study-template
```

## Quick Start

Wrap your main router with the `RouteWrapper`, ensuring you pass a component map mapping step types to your page components.

```tsx
import { RouteWrapper, WelcomePage, SurveyPage, FinalPage } from '@rssa-project/study-template';
import UserCustomPage from './UserCustomPage';

// Map 'step_type' from your study config to React components
const componentMap = {
	welcome: WelcomePage,
	survey: SurveyPage,
	custom_task: UserCustomPage,
	completion: FinalPage,
};

function App() {
	return (
		<Router>
			{/* RouteWrapper handles navigation logic based on study state */}
			<RouteWrapper componentMap={componentMap} WelcomePage={WelcomePage} />
		</Router>
	);
}
```

## Core Features

- **Standard Pages**: `ConsentPage`, `SurveyPage`, `MovieRatingPage`, `DemographicsPage`.
- **Hooks**: `useNextButtonControl`, `useStepCompletion`.
- **Contexts**: Handles participant state and navigation flow automatically.

## Requirements

- React 18+
- `@rssa-project/api` (Peer Dependency)
