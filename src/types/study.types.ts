import type { StudyStep } from "./rssa.types";

export type StudyLayoutContextType = {
  studyStep: StudyStep;
  resetNextButton: () => void;
};
