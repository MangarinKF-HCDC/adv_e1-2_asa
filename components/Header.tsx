"use client";

import NextLink from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion, useAnimationControls, useScroll, useSpring, type Variants } from "framer-motion";
import { useReducedMotion } from "@/lib/reduced-motion";
import { navLinks } from "@/data/navLinks";
import { motionEase } from "@/lib/motion";
import { createNavigationSequence } from "@/lib/navigation";

export default function Header() {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();
  const open = openPath === pathname;
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenPath(null);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <motion.header className="agency-route-navigation" initial={{ opacity: 0, y: reducedMotion ? 0 : -80 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.6, ease: motionEase }}>
      <div className="agency-logo-and-route-links centered-reading-width">
        <TransitionLink href="/" className="agency-home-link" aria-label="Aurora Space Agency home" onClick={() => setOpenPath(null)}>
          <Image src="/aurora-logo.svg" alt="" width={40} height={40} className="agency-logo" />
          <span>AURORA<small>SPACE AGENCY</small></span>
        </TransitionLink>
        <nav className="header-desktop-navigation" aria-label="Main navigation">
          {navLinks.map((link, index) => (
            <motion.div key={link.href} initial={{ opacity: 0, y: reducedMotion ? 0 : -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.4, delay: reducedMotion ? 0 : 0.3 + index * 0.08 }}>
            <TransitionLink href={link.href} className={`header-navigation-link ${isActive(link.href) ? "header-navigation-link-current" : ""}`} aria-current={isActive(link.href) ? "page" : undefined}>
              {link.label}
              {isActive(link.href) && <motion.span className="header-navigation-indicator" layoutId="header-navigation-indicator" transition={{ duration: reducedMotion ? 0 : 0.3 }} />}
            </TransitionLink>
            </motion.div>
          ))}
        </nav>
        <button ref={toggleRef} type="button" className="header-menu-toggle" onClick={() => setOpenPath(open ? null : pathname)} aria-label={open ? "Close navigation menu" : "Open navigation menu"} aria-expanded={open} aria-controls="header-mobile-navigation">
          <span className={open ? "header-menu-toggle-icon header-menu-toggle-open" : "header-menu-toggle-icon"} aria-hidden="true"><span /><span /></span>
        </button>
      </div>
      <motion.nav id="header-mobile-navigation" className="header-mobile-navigation" aria-label="Mobile navigation" inert={!open} aria-hidden={!open} initial={false} animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }} transition={{ duration: reducedMotion ? 0 : 0.3, ease: motionEase }}>
        <AnimatePresence initial={false}>
        {open && <motion.div className="mobile-route-link-list" key={pathname} initial={{ opacity: 0, y: reducedMotion ? 0 : -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reducedMotion ? 0 : -10 }} transition={{ duration: reducedMotion ? 0 : 0.2 }}>
        {navLinks.map((link) => (
          <TransitionLink key={link.href} href={link.href} className={`header-navigation-link ${isActive(link.href) ? "header-navigation-link-current" : ""}`} onClick={() => setOpenPath(null)} aria-current={isActive(link.href) ? "page" : undefined}>{link.label}<span aria-hidden="true">↗</span></TransitionLink>
        ))}
        </motion.div>}
        </AnimatePresence>
      </motion.nav>
    </motion.header>
  );
}

type RouteOptions = { replace?: boolean; scroll?: boolean };
const TransitionContext = createContext<((href: string, options: RouteOptions) => void) | null>(null);
const RouteCoveringContext = createContext(false);

export function useRouteEntryReady() {
  const covering = useContext(RouteCoveringContext);
  const [ready, setReady] = useState(!covering);
  useEffect(() => {
    if (covering || ready) return;
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, [covering, ready]);
  return ready;
}
const curtainVariants: Variants = {
  hidden: { x: "-100%" },
  cover: (index: number) => ({ x: "0%", transition: { duration: 0.55, delay: index * 0.1, ease: [0.76, 0, 0.24, 1] } }),
  reveal: (index: number) => ({ x: "100%", transition: { duration: 0.55, delay: (2 - index) * 0.1, ease: [0.76, 0, 0.24, 1] } }),
};

// Navigation effects live here to keep the shared component folder at three files.
export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const controls = useAnimationControls();
  const reducedMotion = useReducedMotion();
  const [busy, setBusy] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const focusReturn = useRef<{ element: HTMLElement | null; pathname: string } | null>(null);
  const pathnameRef = useRef(pathname);
  const updateBusy = useCallback((value: boolean) => {
    if (value) focusReturn.current = { element: document.activeElement instanceof HTMLElement ? document.activeElement : null, pathname: pathnameRef.current };
    setBusy(value);
  }, []);

  const sequenceRef = useRef<ReturnType<typeof createNavigationSequence> | null>(null);

  useEffect(() => {
    const sequence = createNavigationSequence({
      cover: () => controls.start("cover"),
      reveal: () => controls.start("reveal"),
      reset: () => { controls.stop(); controls.set("hidden"); },
      push: (href, options) => options.replace ? router.replace(href, { scroll: options.scroll }) : router.push(href, { scroll: options.scroll }),
      busy: updateBusy,
      schedule: (callback, delay) => setTimeout(callback, delay),
      cancelTimer: (timer) => clearTimeout(timer),
    });
    sequenceRef.current = sequence;
    sequence.activate();
    const cancel = () => sequence.cancel();
    window.addEventListener("popstate", cancel);
    return () => { window.removeEventListener("popstate", cancel); sequence.dispose(); sequenceRef.current = null; };
  }, [controls, router, updateBusy]);

  useEffect(() => {
    pathnameRef.current = pathname;
    sequenceRef.current?.routeCommitted(pathname);
  }, [pathname]);

  useEffect(() => {
    if (busy || !focusReturn.current) return;
    const previous = focusReturn.current;
    const destination = previous.pathname === pathname ? previous.element : document.getElementById("agency-information");
    destination?.focus({ preventScroll: true });
    focusReturn.current = null;
  }, [busy, pathname]);

  const navigate = useCallback((href: string, options: RouteOptions) => {
    if (reducedMotion) {
      if (options.replace) router.replace(href, { scroll: options.scroll });
      else router.push(href, { scroll: options.scroll });
      return;
    }
    void sequenceRef.current?.navigate(href, pathname, options);
  }, [pathname, reducedMotion, router]);

  return (
    <MotionConfig reducedMotion="user">
      <TransitionContext.Provider value={navigate}>
        <ScrollProgress />
        <RouteCoveringContext.Provider value={busy}><div inert={busy} aria-busy={busy}>{children}</div></RouteCoveringContext.Provider>
        <div className="route-change-curtain" data-covering={busy} aria-hidden="true">
          {["cyan", "violet", "navy"].map((color, index) => (
            <motion.div key={color} className={`route-change-panel route-change-panel-${color}`} custom={index} variants={curtainVariants} initial="hidden" animate={controls}>
              <div className="route-change-leading-glow" />
              {index === 2 && <div className="route-change-agency-identity">
                {logoFailed ? <span className="route-change-logo-fallback">AURORA</span> : <Image src="/aurora-logo.svg" alt="" width={120} height={120} className="route-change-agency-logo" onError={() => setLogoFailed(true)} />}
                <div className="route-change-loading-track"><motion.div className="route-change-loading-sweep" animate={busy && !reducedMotion ? { x: ["-100%", "200%"] } : { x: "0%" }} transition={busy && !reducedMotion ? { duration: 1.2, repeat: Infinity, ease: "linear" } : { duration: 0 }} /></div>
              </div>}
            </motion.div>
          ))}
        </div>
        <p role="status" className="route-change-announcement">{busy ? "Opening page" : ""}</p>
      </TransitionContext.Provider>
    </MotionConfig>
  );
}

export function TransitionLink({ href, onMouseEnter, onFocus, onTouchStart, onNavigate, replace, scroll, ...props }: Omit<ComponentProps<typeof NextLink>, "href"> & { href: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const navigate = useContext(TransitionContext);
  const prefetch = () => {
    if (href.startsWith("/") && !href.startsWith("//")) router.prefetch(href);
  };

  return <NextLink {...props} href={href} replace={replace} scroll={scroll} prefetch={false}
    onMouseEnter={(event) => { onMouseEnter?.(event); if (!event.defaultPrevented) prefetch(); }}
    onFocus={(event) => { onFocus?.(event); if (!event.defaultPrevented) prefetch(); }}
    onTouchStart={(event) => { onTouchStart?.(event); if (!event.defaultPrevented) prefetch(); }}
    onNavigate={(event) => {
      let prevented = false;
      onNavigate?.({ preventDefault: () => { prevented = true; event.preventDefault(); } });
      if (prevented || !navigate || !href.startsWith("/") || href.startsWith("//") || href.split(/[?#]/)[0] === pathname) return;
      // Next only calls onNavigate for ordinary internal clicks, preserving new tabs and downloads.
      event.preventDefault();
      navigate(href, { replace, scroll });
    }} />;
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const reducedMotion = useReducedMotion();
  return <motion.div className="page-reading-progress" aria-hidden="true" style={{ scaleX: reducedMotion ? scrollYProgress : progress }} />;
}
