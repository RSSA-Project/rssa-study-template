import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useNextButtonControl } from "./useNextButtonControl";
import {
  NextButtonContext,
  defaultControl,
} from "../contexts/NextButtonContext";
import React from "react";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NextButtonContext.Provider
    value={{
      buttonControl: defaultControl,
      setButtonControl: vi.fn(),
    }}
  >
    {children}
  </NextButtonContext.Provider>
);

describe("useNextButtonControl", () => {
  it("throws error if used outside provider", () => {
    // Suppress console.error for expected error
    const consoleSpy = vi.spyOn(console, "error");
    consoleSpy.mockImplementation(() => {});

    expect(() => renderHook(() => useNextButtonControl())).toThrow(
      "useNextButtonControl must be used within a NextButtonProvider",
    );

    consoleSpy.mockRestore();
  });

  it("returns context value", () => {
    const { result } = renderHook(() => useNextButtonControl(), { wrapper });
    expect(result.current.buttonControl).toEqual(defaultControl);
    expect(result.current.setButtonControl).toBeDefined();
  });
});
