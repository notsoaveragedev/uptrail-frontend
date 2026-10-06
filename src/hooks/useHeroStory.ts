import { useState } from "react";
import { HERO_STATIC_STEP, storyPhase } from "@/lib/landing";
import { useInterval } from "./useInterval";
import { useMediaQuery } from "./useMediaQuery";

const TICK_MS = 2000;

export function useHeroStory() {
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [liveStep, setLiveStep] = useState(0);

  useInterval(() => setLiveStep((current) => current + 1), prefersReducedMotion ? null : TICK_MS);

  const step = prefersReducedMotion ? HERO_STATIC_STEP : liveStep;
  return { step, phase: storyPhase(step) };
}
