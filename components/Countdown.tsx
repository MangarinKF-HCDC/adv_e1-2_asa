"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/reduced-motion";

const TARGET = new Date("2026-12-31T00:00:00+08:00").getTime();
const labels = ["Days", "Hours", "Minutes", "Seconds"];

export default function Countdown() {
  const reducedMotion = useReducedMotion();
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(Math.max(TARGET - Date.now(), 0));
    const initialTick = window.setTimeout(tick, 0);
    const interval = window.setInterval(tick, 1000);
    return () => { window.clearTimeout(initialTick); window.clearInterval(interval); };
  }, []);

  const values = remaining === null ? null : [
    Math.floor(remaining / 86400000),
    Math.floor(remaining / 3600000) % 24,
    Math.floor(remaining / 60000) % 60,
    Math.floor(remaining / 1000) % 60,
  ];

  return (
    <div>
      <div className="launch-countdown" role="timer" aria-label="Time until the next launch" aria-live="off">
        {labels.map((label, i) => (
          <div className="launch-countdown-unit" key={label}>
            <motion.span key={values?.[i] ?? "pending"} className="launch-countdown-value" initial={{ opacity: 0, y: reducedMotion ? 0 : -8, rotateX: reducedMotion ? 0 : -35 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: reducedMotion ? 0 : 0.25 }}>{values ? String(values[i]).padStart(2, "0") : "--"}</motion.span>
            <span className="launch-countdown-label">{label}</span>
          </div>
        ))}
      </div>
      {remaining === 0 && <p className="launch-countdown-complete" role="status">Launch countdown complete.</p>}
    </div>
  );
}
