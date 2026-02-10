import { createContext, type Dispatch, type SetStateAction } from 'react';

export interface NextButtonControl {
	label: string;
	action: () => void; // The function to execute on click
	isDisabled: boolean; // Whether the button is grayed out
}

export const defaultControl: NextButtonControl = {
	label: 'Continue to Next Step',
	action: () => console.log('Executing Default Global Navigation...'),
	isDisabled: false,
};

export interface NextButtonContextType {
	setButtonControl: Dispatch<SetStateAction<NextButtonControl>>;
	buttonControl: NextButtonControl;
}

export const NextButtonContext = createContext<NextButtonContextType | null>(null);
