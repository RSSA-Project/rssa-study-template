import React from 'react';

interface LoadingTextProps {
    text: string;
}

const LoadingText: React.FC<LoadingTextProps> = ({ text }) => {
    return (
        <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500"></span>
            </span>
            {text}
        </div>
    )
}

export default LoadingText;
