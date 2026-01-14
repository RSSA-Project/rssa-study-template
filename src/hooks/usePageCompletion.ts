import { createContext, useContext } from "react";

interface PageCompletionContextType {
  isPageComplete: boolean;
  setIsPageComplete: (isComplete: boolean) => void;
}

export const PageCompletionContext = createContext<
  PageCompletionContextType | undefined
>(undefined);
export const usePageCompletion = () => {
  const context = useContext(PageCompletionContext);
  if (context === undefined) {
    throw new Error(
      "usePageCompletion must be used within a PageCompletionProvider",
    );
  }
  return context;
};
