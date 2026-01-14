import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 500));
    expect(result.current).toBe("initial");
  });

  it("debounces value updates", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 500 },
      },
    );

    // Update value
    rerender({ value: "updated", delay: 500 });

    // Should still be initial
    expect(result.current).toBe("initial");

    // Fast forward 200ms
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe("initial");

    // Fast forward remaining 300ms
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("updated");

    vi.useRealTimers();
  });
});
