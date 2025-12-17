import React from 'react';

const FinalPage: React.FC = () => {
    // Placeholder for completion code logic
    const completionCode = "RSSA-COMPLETED";

    return (
        <div>
            <div className="mx-auto mt-7 text-left w-1/3">
                <p className="mt-5">
                    Thank you so much for participating in this study. You have reached the end of the study.
                </p>
                <div className="mt-5">
                    <b>Please copy the following code and paste it back to the survey window you came from.</b>
                    <div className="mt-5 border-l-4 border-yellow-400 bg-yellow-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    <span className="font-bold">Completion Code: </span>
                                    {completionCode || 'Loading...'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinalPage;
