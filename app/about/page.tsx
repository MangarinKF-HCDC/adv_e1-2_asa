"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { TransitionLink as Link, useRouteEntryReady } from "@/components/Header";
import { animate, motion, useInView } from "framer-motion";
import { useReducedMotion } from "@/lib/reduced-motion";
import Background from "@/components/Background";
import { crew, type CrewMember } from "@/data/crew";
import { values, type AgencyValue } from "@/data/values";
import { missions } from "@/data/missions";
import aboutBackground from "@/public/about-base.webp";
import { motionVariants, revealViewport } from "@/lib/motion";

const facts = [
  { label: "Founded", to: 2019 },
  { label: "Missions", to: missions.length },
  { label: "Crew members", to: crew.length },
];

export default function About() {
  const entryReady = useRouteEntryReady();
  const reducedMotion = useReducedMotion();
  const { up: fadeUp, left, scale, stagger } = motionVariants(reducedMotion);
  const hover = reducedMotion ? undefined : { y: -6 };

  return (
    <>
      <Background src={aboutBackground} />
      <div className="agency-purpose-and-crew-overview centered-reading-width">
        <section className="crew-and-purpose-introduction" aria-labelledby="crew-and-purpose-heading">
          <h1 id="crew-and-purpose-heading">
            <HeadingWords text="The people behind" delay={0.2} /><br className="wide-screen-heading-line-break" /> <HeadingWords text="the" delay={0.45} /> <span className="crew-mission-emphasis"><HeadingWords text="missions" delay={0.6} /></span>
          </h1>
          <motion.p className="crew-and-purpose-summary" variants={fadeUp} initial="hidden" animate={entryReady ? "show" : "hidden"} custom={2}>
            A small crew with one goal: explore our solar system and share what we learn.
          </motion.p>
        </section>
  
        <section className="agency-mission-statement-introduction" aria-labelledby="about-mission-heading">
          <motion.div className="agency-mission-statement" variants={scale} initial="hidden" whileInView={entryReady ? "show" : "hidden"} viewport={revealViewport} whileHover={hover}>
            <h2 id="about-mission-heading" className="agency-mission-statement-label">Our mission</h2>
            <p>
              Aurora Space Agency explores our solar system and shares what we learn.
              We name every mission in Filipino to honor where we come from.
            </p>
          </motion.div>
        </section>
  
        <section className="agency-founding-and-mission-totals" aria-label="Aurora at a glance">
          <motion.dl className="agency-facts-list" variants={stagger()} initial="hidden" whileInView={entryReady ? "show" : "hidden"} viewport={revealViewport}>
            {facts.map((fact) => (
              <motion.div key={fact.label} className="agency-fact-card" variants={fadeUp} whileHover={hover}>
                <dt className="agency-fact-label">{fact.label}</dt>
                <dd><CountUp to={fact.to} /></dd>
              </motion.div>
            ))}
          </motion.dl>
        </section>
  
        <section className="crew-roster" aria-labelledby="about-crew-heading">
          <motion.div className="crew-roster-introduction" variants={left} initial="hidden" whileInView={entryReady ? "show" : "hidden"} viewport={revealViewport}>
            <p className="crew-roster-introduction-label">The people who take us further</p>
            <h2 id="about-crew-heading">Meet the <span>crew</span></h2>
          </motion.div>
          <div className="crew-profile-roster">
            {crew.map((member, index) => <CrewCard key={member.name} member={member} index={index} />)}
          </div>
        </section>
  
        <section className="agency-values" aria-labelledby="about-values-heading">
          <motion.div className="agency-values-introduction" variants={left} initial="hidden" whileInView={entryReady ? "show" : "hidden"} viewport={revealViewport}>
            <p className="agency-values-introduction-label">What guides every journey</p>
            <h2 id="about-values-heading">Core <span>values</span></h2>
          </motion.div>
          <div className="agency-values-list">
            {values.map((value, index) => <ValueCard key={value.word} value={value} index={index} />)}
          </div>
        </section>
  
        <section className="mission-history-invitation" aria-labelledby="mission-history-invitation-heading">
          <motion.div className="mission-history-invitation-details" variants={fadeUp} initial="hidden" whileInView={entryReady ? "show" : "hidden"} viewport={{ once: true, amount: 0.2 }} whileHover={hover}>
            <div>
              <p className="mission-history-invitation-label">The next chapter is out there</p>
              <h2 id="mission-history-invitation-heading">See where the crew has flown</h2>
            </div>
            <Link href="/portfolio" className="view-mission-history-link">View missions <span aria-hidden="true">↗</span></Link>
          </motion.div>
        </section>
      </div>
    </>
  );
}

function CountUp({ to, duration = 1.5 }: { to: number; duration?: number }) {
  const entryReady = useRouteEntryReady();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reducedMotion = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView || reducedMotion || !entryReady) return;
    const controls = animate(0, to, {
      duration: Math.max(0, duration),
      ease: "easeOut",
      onUpdate: (next) => setValue(Math.round(next)),
    });
    return () => controls.stop();
  }, [inView, reducedMotion, to, duration, entryReady]);

  return (
    <span ref={ref}>
      <span aria-hidden="true">{reducedMotion ? to : value}</span>
      <span className="countup-announced-total">{to}</span>
    </span>
  );
}

function CrewCard({ member, index }: { member: CrewMember; index: number }) {
  const entryReady = useRouteEntryReady();
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  return (
    <motion.article
      className="crew-card"
      initial={{ opacity: 0, y: reducedMotion ? 0 : 24 }}
      whileInView={entryReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : index * 0.12 }}
      whileHover={reducedMotion ? undefined : { y: -6, transition: { duration: 0.2, delay: 0 } }}
      aria-labelledby={`about-crew-${member.initials}-heading`}
    >
      <div className="crew-card-portrait">
        <motion.div className="crew-portrait-orbit-ring" aria-hidden="true" animate={reducedMotion ? { rotate: 0 } : { rotate: 360 }} transition={reducedMotion ? { duration: 0 } : { duration: 20, repeat: Infinity, ease: "linear" }} />
        <div className="crew-card-portrait-glow" aria-hidden="true" />
        <div className="crew-card-photo-frame">
          <span className="crew-card-initials" aria-hidden="true">{member.initials}</span>
          {member.photo && failedPhoto !== member.photo && (
            <Image
              src={member.photo}
              alt={`Portrait of ${member.name}`}
              fill
              unoptimized
              sizes="128px"
              className="crew-card-photo"
              onError={() => setFailedPhoto(member.photo ?? null)}
            />
          )}
        </div>
      </div>
      <h3 id={`about-crew-${member.initials}-heading`}>{member.name}</h3>
      <p className="crew-card-role">{member.role}</p>
      <p className="crew-card-biography">{member.line}</p>
    </motion.article>
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

function ValueCard({ value, index }: { value: AgencyValue; index: number }) {
  const entryReady = useRouteEntryReady();
  const reducedMotion = useReducedMotion();

  return (
    <motion.article
      className="agency-value-card"
      initial={{ opacity: 0, y: reducedMotion ? 0 : 24 }}
      whileInView={entryReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : index * 0.12 }}
      whileHover={reducedMotion ? undefined : { y: -6, transition: { duration: 0.2, delay: 0 } }}
    >
      <span className="agency-value-number" aria-hidden="true">0{index + 1} /</span>
      <h3 className="agency-value-name" lang="fil">{value.word}</h3>
      <p className="agency-value-translation">{value.meaning}</p>
      <p className="agency-value-description">{value.text}</p>
    </motion.article>
  );
}
