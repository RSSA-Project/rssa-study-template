import { useState, type ReactNode } from "react";
import { PageCompletionContext } from "../hooks/usePageCompletion";

export const PageCompletionProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isPageComplete, setIsPageComplete] = useState(false);
  const value = { isPageComplete, setIsPageComplete };

  return (
    <PageCompletionContext.Provider value={value}>
      {children}
    </PageCompletionContext.Provider>
  );
};
