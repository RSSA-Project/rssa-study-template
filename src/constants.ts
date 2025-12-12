export const STRINGS = {
	WINDOW_TOO_SMALL: `<p>This study requires your browser to be at least 
					<strong><underline>1200 pixels wide</underline></strong>. 
					Please resize your browser window or use a device with a 
					larger screen.</p>`,
	STUDY_ERROR: `<p>There was an error loading the study. 
					Please try again later.</p><p>If the problem persists, 
					please contact the study administrator.</p>`,
};

export const customBreakpoints = {
	xl: 1200,
	xxl: 1400,
	xxxl: 1800, // Custom breakpoint for viewport size greater than 1800px
	xl4: 2000,
};

export const RETRY_DELAYS_MS = [5000, 10000, 30000, 60000];
