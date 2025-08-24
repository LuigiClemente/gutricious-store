// Type definitions for GSAP and ScrollTrigger
interface ScrollTriggerInstance {
  kill: () => void;
}

interface ScrollTrigger {
  getAll: () => ScrollTriggerInstance[];
  refresh: () => void;
}

interface GSAPTimeline {
  scrollTrigger?: ScrollTriggerInstance;
  to: (target: any, vars: object) => GSAPTimeline;
}

interface GSAP {
  timeline: (vars?: object) => GSAPTimeline;
  registerPlugin: (plugin: any) => void;
}

interface Window {
  gsap: GSAP;
  ScrollTrigger: ScrollTrigger;
}
