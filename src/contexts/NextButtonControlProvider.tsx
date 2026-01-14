import { useState } from "react";
import {
  defaultControl,
  NextButtonContext,
  type NextButtonContextType,
} from "./NextButtonContext";

export const NextButtonControlProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [buttonControl, setButtonControl] = useState(defaultControl);
  const contextValue: NextButtonContextType = {
    setButtonControl,
    buttonControl,
  };
  return (
    <NextButtonContext.Provider value={contextValue}>
      {children}
    </NextButtonContext.Provider>
  );
};
