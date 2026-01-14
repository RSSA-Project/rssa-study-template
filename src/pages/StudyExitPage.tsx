import React from "react";

const StudyExitPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Something went wrong!
        </h1>
        <p className="text-gray-600">Please contact the study administrator.</p>
        <p className="text-gray-500 text-sm">
          Thank you for supporting the scientific community.
        </p>
      </div>
    </div>
  );
};

export default StudyExitPage;
