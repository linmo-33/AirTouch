import { useRef, useCallback } from "react";

/**
 * RAF 节流 Hook（从 Web 版复用）
 */
export const useRAFThrottle = <T extends (...args: any[]) => void>(
  callback: T
): T => {
  const rafId = useRef<number | null>(null);
  const lastArgs = useRef<any[] | null>(null);

  const throttledFn = useCallback(
    (...args: any[]) => {
      lastArgs.current = args;

      if (rafId.current === null) {
        rafId.current = requestAnimationFrame(() => {
          if (lastArgs.current) {
            callback(...lastArgs.current);
          }
          rafId.current = null;
          lastArgs.current = null;
        });
      }
    },
    [callback]
  );

  return throttledFn as T;
};
