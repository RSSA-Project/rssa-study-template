import React, { createContext, useContext, type ReactNode } from "react";

interface StudyUrlParams {
  participantTypeKey: string;
  externalId: string;
  isTestMode: boolean;
}

const StudyUrlParamsContext = createContext<StudyUrlParams | undefined>(
  undefined,
);

export const useStudyUrlParams = (): StudyUrlParams => {
  const context = useContext(StudyUrlParamsContext);
  if (context === undefined) {
    throw new Error(
      "useStudyUrlParams must be used within a StudyUrlParamsProvider",
    );
  }
  return context;
};

export const StudyUrlParamsProvider: React.FC<{
  children: ReactNode;
  params: StudyUrlParams;
}> = ({ children, params }) => {
  return (
    <StudyUrlParamsContext.Provider value={params}>
      {children}
    </StudyUrlParamsContext.Provider>
  );
};
