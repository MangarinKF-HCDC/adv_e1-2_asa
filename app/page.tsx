"use client";

import { TransitionLink as Link, useRouteEntryReady } from "@/components/Header";
import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "framer-motion";
import { useReducedMotion } from "@/lib/reduced-motion";
import Background from "@/components/Background";
import Countdown from "@/components/Countdown";
import indexBackground from "@/public/index-base.webp";
import { missions } from "@/data/missions";
import { motionVariants, revealViewport } from "@/lib/motion";

const stats = [
  { to: missions.length, label: "Missions", detail: "Every launch, a new possibility." },
  { to: missions.filter((mission) => mission.status === "complete").length, label: "Completed", detail: "From orbit to new worlds." },
  { to: new Set(missions.map((mission) => mission.destination)).size, label: "Destinations", detail: "Each destination, a new perspective." },
];

export default function Home() {
  const entryReady = useRouteEntryReady();
  const reducedMotion = useReducedMotion();
  const { up: fadeUp, left } = motionVariants(reducedMotion);

  return (
    <>
      <Background src={indexBackground} />
      <div className="agency-launch-and-mission-overview">
        <section className="agency-introduction centered-reading-width" aria-labelledby="agency-introduction-heading">
          <h1 id="agency-introduction-heading">
            <HeadingWords text="Reach beyond" delay={0.3} /><br /><HeadingWords text="the" delay={0.5} /> <span className="agency-horizon-emphasis"><HeadingWords text="horizon." delay={0.7} /></span>
          </h1>
          <motion.p className="agency-introduction-summary" variants={fadeUp} initial="hidden" animate={entryReady ? "show" : "hidden"} custom={2}>
            We build rockets, fly crews, and map new worlds.<br className="wide-screen-heading-line-break" /> Follow the next launch.
          </motion.p>
          <motion.div className="mission-and-photo-navigation" variants={fadeUp} initial="hidden" animate={entryReady ? "show" : "hidden"} custom={3}>
            <Link href="/portfolio" className="explore-missions-link">View missions <span aria-hidden="true">↗</span></Link>
            <Link href="/gallery" className="browse-mission-photos-link">Open gallery <span aria-hidden="true">→</span></Link>
          </motion.div>
          <motion.div className="home-launch-countdown" variants={fadeUp} initial="hidden" animate={entryReady ? "show" : "hidden"} custom={4}>
            <div className="next-launch-label-and-date">
              <p className="next-launch-label">Next launch in</p>
              <span className="home-launch-date">DEC 31, 2026 · 00:00 PHT</span>
            </div>
            <Countdown />
          </motion.div>
          <motion.a className="home-statistics-scroll-link" href="#home-mission-statistics" initial={{ opacity: 0 }} animate={{ opacity: entryReady ? 1 : 0 }} transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 1.6 }}><motion.span aria-hidden="true" animate={reducedMotion ? { y: 0 } : { y: [0, 8, 0] }} transition={reducedMotion ? { duration: 0 } : { duration: 1.6, repeat: Infinity }}>↓</motion.span> Explore the journey</motion.a>
        </section>

        <section id="home-mission-statistics" className="home-mission-statistics centered-reading-width" aria-labelledby="home-mission-statistics-heading">
          <motion.div className="mission-statistics-introduction" variants={left} initial="hidden" whileInView={entryReady ? "show" : "hidden"} viewport={revealViewport}>
            <p className="mission-statistics-introduction-label">Our journey so far</p>
            <h2 id="home-mission-statistics-heading">Small steps. <span>Limitless possibilities.</span></h2>
          </motion.div>
          <div className="mission-statistics-grid">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} className="mission-statistic-card" variants={fadeUp} initial="hidden" whileInView={entryReady ? "show" : "hidden"} viewport={{ once: true, amount: 0.25 }} custom={i} whileHover={reducedMotion ? undefined : { y: -6 }}>
                <span className="mission-statistic-number" aria-hidden="true">0{i + 1} /</span>
                <p className="mission-statistic-value"><CountUp to={stat.to} /></p>
                <h3 className="mission-statistic-label">{stat.label}</h3>
                <p className="mission-statistic-description">{stat.detail}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="crew-profile-invitation centered-reading-width" aria-labelledby="home-crew-heading">
          <motion.div className="crew-profile-invitation-details" variants={fadeUp} initial="hidden" whileInView={entryReady ? "show" : "hidden"} viewport={{ once: true, amount: 0.25 }}>
            <div>
              <p className="crew-profile-invitation-label">The people behind the progress</p>
              <h2 id="home-crew-heading">Meet the crew behind<br className="wide-screen-heading-line-break" /> the missions.</h2>
              <p>Great journeys begin with people who dare to go further.</p>
            </div>
            <Link href="/about" className="meet-astronauts-link">About us <span aria-hidden="true">↗</span></Link>
          </motion.div>
        </section>
        <motion.footer className="agency-credits-and-home-link centered-reading-width" initial={{ opacity: 0 }} whileInView={{ opacity: entryReady ? 1 : 0 }} viewport={revealViewport} transition={{ duration: reducedMotion ? 0 : 0.6 }}>
          <Link href="/" className="agency-credits-home-link">AURORA</Link>
          <p>Beyond Earth. Beyond expectations.</p>
          <span>© 2026 Aurora Space Agency</span>
        </motion.footer>
      </div>
    </>
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

function CountUp({ to }: { to: number }) {
  const entryReady = useRouteEntryReady();
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true, amount: 0.4 });
  const reducedMotion = useReducedMotion();
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!visible || reducedMotion || !entryReady) return;
    const controls = animate(0, to, { duration: 1.5, ease: "easeOut", onUpdate: (next) => setValue(Math.round(next)) });
    return () => controls.stop();
  }, [visible, reducedMotion, to, entryReady]);
  return <span ref={ref}><span aria-hidden="true">{reducedMotion ? to : value}</span><span className="countup-announced-total">{to}</span></span>;
}
