import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

describe("useDebouncedValue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return initial value immediately", () => {
    const { result } = renderHook(() => useDebouncedValue("initial", 300));
    expect(result.current).toBe("initial");
  });

  it("should debounce value changes", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: "initial", delay: 300 } }
    );

    expect(result.current).toBe("initial");

    rerender({ value: "updated", delay: 300 });
    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("updated");
  });

  it("should call onUpdate after debounce", () => {
    const onUpdate = vi.fn();
    const { rerender } = renderHook(
      ({ value, delay, onUpdate }) => useDebouncedValue(value, delay, onUpdate),
      { initialProps: { value: "initial", delay: 300, onUpdate } }
    );

    rerender({ value: "updated", delay: 300, onUpdate });

    expect(onUpdate).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onUpdate).toHaveBeenCalledTimes(1);
  });

  it("should not call onUpdate on initial render", () => {
    const onUpdate = vi.fn();
    renderHook(() => useDebouncedValue("initial", 300, onUpdate));

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("should clear previous timer when value changes", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: "initial", delay: 300 } }
    );

    rerender({ value: "first-update", delay: 300 });

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current).toBe("initial");

    rerender({ value: "second-update", delay: 300 });

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current).toBe("second-update");
  });

  it("should use custom delay", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: "initial", delay: 500 } }
    );

    rerender({ value: "updated", delay: 500 });

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe("updated");
  });

  it("should cleanup timer on unmount after value change", () => {
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");
    const { result, rerender, unmount } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: "initial", delay: 300 } }
    );

    expect(result.current).toBe("initial");

    rerender({ value: "changed", delay: 300 });

    expect(result.current).toBe("initial");

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it("should handle number values", () => {
    const { result } = renderHook(() => useDebouncedValue(42, 300));
    expect(result.current).toBe(42);
  });

  it("should handle object values", () => {
    const { result } = renderHook(() => useDebouncedValue({ key: "value" }, 300));
    expect(result.current).toEqual({ key: "value" });
  });

  it("should handle array values", () => {
    const { result } = renderHook(() => useDebouncedValue([1, 2, 3], 300));
    expect(result.current).toEqual([1, 2, 3]);
  });

  it("should handle null values", () => {
    const { result } = renderHook(() => useDebouncedValue(null, 300));
    expect(result.current).toBeNull();
  });

  it("should handle undefined values", () => {
    const { result } = renderHook(() => useDebouncedValue(undefined, 300));
    expect(result.current).toBeUndefined();
  });
});
