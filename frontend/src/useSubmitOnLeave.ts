import { useEffect, useRef } from "react";

/**
 * Best-effort: when this component is about to unmount (e.g. switching to
 * another activity/sub-activity) while `shouldSubmit` is true, calls
 * `submit()`.
 *
 * This does NOT block navigation. react-router's useBlocker would give
 * that guarantee, but it requires a data router (createBrowserRouter +
 * RouterProvider) — this app uses the plain <BrowserRouter>, where
 * useBlocker throws immediately. So this is a safety net, not a guarantee:
 * navigation always proceeds right away, and refs a `submit` closure
 * depends on (e.g. a form ref) could in principle already be torn down by
 * the time this cleanup runs.
 */
export function useSubmitOnLeave(shouldSubmit: boolean, submit: () => void | Promise<void>) {
  const shouldSubmitRef = useRef(shouldSubmit);
  shouldSubmitRef.current = shouldSubmit;

  const submitRef = useRef(submit);
  submitRef.current = submit;

  useEffect(() => {
    return () => {
      if (shouldSubmitRef.current) submitRef.current();
    };
  }, []);
}
