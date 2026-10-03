"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/reduced-motion";
import { useRouteEntryReady } from "@/components/Header";

export default function Template({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();
  const entryReady = useRouteEntryReady();
  // No wrapper transform: the fixed background must stay anchored to the viewport.
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: entryReady ? 1 : 0 }} transition={{ duration: reducedMotion ? 0 : 0.4 }}>{children}</motion.div>;
}
