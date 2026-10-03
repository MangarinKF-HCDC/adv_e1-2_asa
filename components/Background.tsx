"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { useReducedMotion } from "@/lib/reduced-motion";

export default function Background({ src }: { src: string | StaticImageData }) {
  const reducedMotion = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const { scrollYProgress } = useScroll();
  const x = useSpring(useTransform(mx, [-0.5, 0.5], [-18, 18]), { stiffness: 60, damping: 20 });
  const y = useSpring(useTransform(my, [-0.5, 0.5], [-18, 18]), { stiffness: 60, damping: 20 });
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1.25]);
  const lift = useTransform(scrollYProgress, [0, 1], [0, -50]);

  useEffect(() => {
    if (reducedMotion) return;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      mx.set(event.clientX / window.innerWidth - 0.5);
      my.set(event.clientY / window.innerHeight - 0.5);
    };
    const reset = () => { mx.set(0); my.set(0); };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", reset);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", reset);
    };
  }, [mx, my, reducedMotion]);

  return (
    <div className="route-background-parallax" aria-hidden="true">
      <motion.div className="background-pointer-parallax" style={reducedMotion ? undefined : { x, y }}>
        <motion.div className="background-scroll-parallax" style={reducedMotion ? undefined : { scale, y: lift }}>
          <Image src={src} alt="" fill preload sizes="100vw" className="route-background-photograph" />
        </motion.div>
      </motion.div>
      <div className="background-readability-overlay" />
    </div>
  );
}
