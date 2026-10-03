type NavigationOptions = { replace?: boolean; scroll?: boolean };
type NavigationEffects = {
  cover: () => Promise<unknown>;
  reveal: () => Promise<unknown>;
  reset: () => void;
  push: (href: string, options: NavigationOptions) => void;
  busy: (value: boolean) => void;
  schedule: (callback: () => void, delay: number) => ReturnType<typeof setTimeout>;
  cancelTimer: (timer: ReturnType<typeof setTimeout>) => void;
};

// Timers belong to one navigation, so a previous timeout cannot interrupt the next.
export function createNavigationSequence(effects: NavigationEffects) {
  let phase: "idle" | "covering" | "waiting" | "revealing" = "idle";
  let generation = 0;
  let origin = "";
  let disposed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const clearTimer = () => {
    if (timer !== undefined) effects.cancelTimer(timer);
    timer = undefined;
  };
  const finish = (sequence: number) => {
    if (disposed || sequence !== generation) return;
    clearTimer();
    effects.reset();
    phase = "idle";
    effects.busy(false);
  };
  const reveal = (delay = 350) => {
    if (disposed || phase !== "waiting") return;
    clearTimer();
    phase = "revealing";
    const sequence = generation;
    timer = effects.schedule(() => {
      timer = undefined;
      if (disposed || sequence !== generation) return;
      void effects.reveal().then(() => finish(sequence), () => finish(sequence));
    }, delay);
  };

  return {
    activate() { disposed = false; phase = "idle"; effects.reset(); },
    async navigate(href: string, pathname: string, options: NavigationOptions = {}) {
      if (disposed || phase !== "idle" || href.split(/[?#]/)[0] === pathname) return;
      phase = "covering";
      origin = pathname;
      const sequence = ++generation;
      effects.busy(true);
      try {
        await effects.cover();
        if (disposed || sequence !== generation) return;
        phase = "waiting";
        timer = effects.schedule(() => { if (sequence === generation && !disposed) reveal(0); }, 4000);
        effects.push(href, options);
      } catch {
        if (sequence === generation && !disposed) {
          phase = "waiting";
          reveal(0);
        }
      }
    },
    routeCommitted(pathname: string) {
      if (phase === "waiting" && pathname !== origin) reveal();
    },
    cancel() {
      if (disposed) return;
      ++generation;
      clearTimer();
      effects.reset();
      phase = "idle";
      effects.busy(false);
    },
    dispose() {
      disposed = true;
      ++generation;
      clearTimer();
    },
  };
}
