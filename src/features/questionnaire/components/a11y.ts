import { useRef, type KeyboardEvent } from "react";

/** Hidden on screen, still read by screen readers (status messages, extra hints). */
export const srOnly = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;

/**
 * WAI-ARIA radio group keys: Down/Right → next, Up/Left → previous (both wrap), Home/End → ends.
 * Returns null for any other key, so the caller leaves the event alone.
 */
export function nextRadioIndex(key: string, current: number, count: number): number | null {
  if (count <= 0) return null;
  switch (key) {
    case "ArrowDown":
    case "ArrowRight":
      return (current + 1) % count;
    case "ArrowUp":
    case "ArrowLeft":
      return (current - 1 + count) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return null;
  }
}

/** Roving tabindex: one Tab stop per group – the checked radio, or the first one when none is checked. */
export function rovingTabIndex(index: number, selectedIndex: number): 0 | -1 {
  const stop = selectedIndex >= 0 ? selectedIndex : 0;
  return index === stop ? 0 : -1;
}

/**
 * Props for the items of a custom radio group: single Tab stop, arrows move focus and selection.
 * `onArrowSelect` is called for arrow/Home/End moves only (callers use it to skip auto-advance).
 */
export function useRovingRadio(count: number, selectedIndex: number, onArrowSelect: (index: number) => void) {
  const items = useRef<(HTMLElement | null)[]>([]);

  return (index: number) => ({
    tabIndex: rovingTabIndex(index, selectedIndex),
    ref: (element: HTMLElement | null) => {
      items.current[index] = element;
    },
    onKeyDown: (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const next = nextRadioIndex(event.key, index, count);
      if (next === null) return;
      event.preventDefault();
      items.current[next]?.focus();
      onArrowSelect(next);
    },
  });
}
