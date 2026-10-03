"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/reduced-motion";
import { useRouteEntryReady } from "@/components/Header";
import Background from "@/components/Background";
import { missions, type Mission } from "@/data/missions";
import portfolioBackground from "@/public/portfolio-base.webp";
import { motionVariants, revealViewport } from "@/lib/motion";

export default function Portfolio() {
  const entryReady = useRouteEntryReady();
  const { up } = motionVariants(useReducedMotion());
  return (
    <>
      <Background src={portfolioBackground} />
      <section className="mission-history-overview centered-reading-width" aria-labelledby="portfolio-missions-heading">
        <div className="mission-history-introduction">
          <h1 id="portfolio-missions-heading"><HeadingWords text="Four missions," delay={0.2} /> <span className="mission-history-path-emphasis"><HeadingWords text="one path" delay={0.5} /></span></h1>
          <motion.p className="mission-history-summary" variants={up} initial="hidden" animate={entryReady ? "show" : "hidden"} custom={2}>
            From the station to Mars. Each mission carries a Filipino name and
            moves us farther from home.
          </motion.p>
        </div>
        <div className="portfolio-mission-history">
          <motion.div className="mission-timeline-legend" variants={up} initial="hidden" animate={entryReady ? "show" : "hidden"} custom={3}>
            <p><span className="mission-legend-indicator mission-legend-complete" aria-hidden="true" />Complete</p>
            <p><span className="mission-legend-indicator mission-legend-active" aria-hidden="true" />Active mission</p>
          </motion.div>
          <Timeline missions={missions} />
        </div>
      </section>
    </>
  );
}

function Timeline({ missions }: { missions: Mission[] }) {
  const entryReady = useRouteEntryReady();
  const reducedMotion = useReducedMotion();
  const { stagger, up } = motionVariants(reducedMotion);

  return (
    <div className="mission-timeline-drawing">
      <motion.div className="mission-timeline-desktop-connector" aria-hidden="true" initial={{ scaleX: reducedMotion ? 1 : 0 }} whileInView={{ scaleX: entryReady ? 1 : 0 }} viewport={revealViewport} transition={{ duration: reducedMotion ? 0 : 1.2, ease: "easeOut" }} />
      <motion.div className="mission-timeline-mobile-connector" aria-hidden="true" initial={{ scaleY: reducedMotion ? 1 : 0 }} whileInView={{ scaleY: entryReady ? 1 : 0 }} viewport={revealViewport} transition={{ duration: reducedMotion ? 0 : 1.2, ease: "easeOut" }} />
      <motion.ol
      className="mission-timeline"
      aria-label="Mission timeline from the International Space Station to Mars"
      variants={stagger()}
      initial="hidden"
      whileInView={entryReady ? "show" : "hidden"}
      viewport={{ once: true, amount: 0.1 }}
    >
      {missions.map((mission, index) => (
        <motion.li
          key={mission.code}
          className={`mission-timeline-item mission-timeline-status-${mission.status}`}
          variants={up}
        >
          <motion.span className="mission-timeline-node" aria-hidden="true" initial={{ scale: reducedMotion ? 1 : 0 }} whileInView={{ scale: entryReady ? 1 : 0 }} viewport={{ once: true }} transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 15, delay: 0.2 + index * 0.15 }}>
            {mission.status === "active" && <span className="mission-timeline-active-pulse" />}
          </motion.span>
          <motion.article className="mission-card" aria-labelledby={`mission-${mission.code}-heading`} whileHover={reducedMotion ? undefined : { y: -6 }} transition={{ duration: 0.2 }}>
            <div className="mission-card-summary">
              <span className="mission-card-year">{mission.year}</span>
              <span className="mission-card-status">{mission.status}</span>
            </div>
            <p className="mission-card-code mission-code-label">{mission.code}</p>
            <h2 id={`mission-${mission.code}-heading`} className="mission-card-name">{mission.name}</h2>
            <p className="mission-card-name-meaning">{mission.meaning}</p>
            <p className="mission-card-goal"><span>Goal:</span> {mission.goal}</p>
            <div className="mission-card-destination">
              <span className="mission-destination-label">Destination</span>
              <p>{mission.destination}</p>
            </div>
          </motion.article>
        </motion.li>
      ))}
      </motion.ol>
    </div>
  );
}

function HeadingWords({ text, delay = 0 }: { text: string; delay?: number }) {
  const entryReady = useRouteEntryReady();
  const { word, stagger } = motionVariants(useReducedMotion());
  const words = text.split(" ");
  return <motion.span className="heading-word-sequence" variants={stagger(0.08, delay)} initial="hidden" animate={entryReady ? "show" : "hidden"}>
    <span className="heading-announced-text">{text}</span>
    {words.map((value, index) => <span key={`${value}-${index}`} className="heading-word-mask" aria-hidden="true"><motion.span className="heading-word-rise" variants={word}>{value}</motion.span>{index < words.length - 1 ? "\u00a0" : ""}</span>)}
  </motion.span>;
}
