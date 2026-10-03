"use client";

import { useSyncExternalStore } from "react";

const motionPreferenceQuery = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const preference = window.matchMedia(motionPreferenceQuery);
  preference.addEventListener("change", onChange);
  return () => preference.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(motionPreferenceQuery).matches;
}

function getServerSnapshot() {
  return false;
}

export function useReducedMotion() {
  // React reuses this server snapshot during hydration, then reads the browser
  // preference. Text and initial animation styles therefore match on both sides.
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
