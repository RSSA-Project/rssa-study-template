import { useContext } from 'react';
import { NextButtonContext } from '../contexts/NextButtonContext';

export const useNextButtonControl = () => {
    const context = useContext(NextButtonContext);
    if (context === null) {
        throw new Error('useNextButtonControl must be used within a NextButtonProvider');
    }
    return context;
};
