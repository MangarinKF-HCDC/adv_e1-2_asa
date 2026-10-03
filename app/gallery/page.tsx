"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { TransitionLink as Link, useRouteEntryReady } from "@/components/Header";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useReducedMotion } from "@/lib/reduced-motion";
import Background from "@/components/Background";
import { categories, photos, type GalleryCategory, type GalleryPhoto } from "@/data/gallery";
import galleryBackground from "@/public/about-base.webp";
import { motionVariants, revealViewport } from "@/lib/motion";

export default function Gallery() {
  const entryReady = useRouteEntryReady();
  const reducedMotion = useReducedMotion();
  const { up } = motionVariants(reducedMotion);

  return (
    <>
      <Background src={galleryBackground} />
      <div className="mission-photo-browser centered-reading-width">
        <section
          className="mission-photo-introduction"
          aria-labelledby="gallery-mission-photos-heading"
        >
          <h1 id="gallery-mission-photos-heading"><HeadingWords text="Views from the" delay={0.2} /> <span className="mission-photo-emphasis"><HeadingWords text="missions" delay={0.5} /></span></h1>
          <motion.p className="mission-photo-introduction-summary" variants={up} initial="hidden" animate={entryReady ? "show" : "hidden"} custom={2}>Six photos from the launch pad to the surface of Mars.</motion.p>
        </section>

        <GalleryGrid />

        <motion.section
          className="mission-photo-history-invitation"
          aria-labelledby="mission-photo-history-invitation-heading"
          initial={{ opacity: 0, y: reducedMotion ? 0 : 24 }}
          whileInView={entryReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: reducedMotion ? 0 : 0.6 }}
        >
          <p className="mission-photo-story-label">Every view has a story</p>
          <h2 id="mission-photo-history-invitation-heading">Follow the full mission path</h2>
          <Link href="/portfolio" className="view-mission-history-link">View missions <span aria-hidden="true">↗</span></Link>
        </motion.section>
      </div>
    </>
  );
}

function GalleryGrid() {
  const entryReady = useRouteEntryReady();
  const [filter, setFilter] = useState<GalleryCategory>("all");
  const [active, setActive] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();
  const visible = useMemo(() => filter === "all" ? photos : photos.filter((photo) => photo.category === filter), [filter]);
  const activeIndex = visible.findIndex((photo) => photo.id === active);
  const close = useCallback(() => setActive(null), []);
  const changePhoto = useCallback((direction: number) => {
    setActive((id) => {
      const index = visible.findIndex((photo) => photo.id === id);
      return index < 0 ? null : visible[(index + direction + visible.length) % visible.length].id;
    });
  }, [visible]);

  return (
    <section className="gallery-photo-collection" aria-label="Mission photos">
      <motion.div className="destination-filter-and-photo-count" variants={motionVariants(reducedMotion).up} initial="hidden" animate={entryReady ? "show" : "hidden"} custom={3}>
        <LayoutGroup id="gallery-destination-selection">
        <div className="gallery-destination-filters" role="group" aria-label="Filter photos by destination">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={filter === category}
              aria-controls="gallery-photo-grid"
              onClick={() => { setFilter(category); setActive(null); }}
              className={`gallery-destination-filter ${filter === category ? "gallery-destination-filter-selected" : ""}`}
            >
              {filter === category && <motion.span className="selected-destination-highlight" layoutId={reducedMotion ? undefined : "gallery-selected-destination"} aria-hidden="true" transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 30 }} />}
              <span className="destination-filter-name">{category}</span>
            </button>
          ))}
        </div>
        </LayoutGroup>
      </motion.div>

      <motion.div id="gallery-photo-grid" layout={!reducedMotion} className="gallery-photo-grid">
        <AnimatePresence mode="popLayout">
          {visible.map((photo, index) => (
            <motion.button
              key={photo.id}
              type="button"
              layout={!reducedMotion}
              initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.96 }}
              whileInView={entryReady ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1 }}
              viewport={revealViewport}
              exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.96, transition: { duration: reducedMotion ? 0 : 0.2, delay: 0 } }}
              transition={{ duration: reducedMotion ? 0 : 0.4, delay: reducedMotion ? 0 : index * 0.08, layout: { duration: reducedMotion ? 0 : 0.35, delay: 0 } }}
              className={`gallery-photo-button gallery-photo-button-${photo.span}`}
              aria-label={`Open ${photo.title} — ${photo.mission}, ${photo.place}`}
              aria-haspopup="dialog"
              onClick={() => setActive(photo.id)}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                placeholder="blur"
                sizes={photo.span === "wide"
                  ? "(min-width: 1248px) 763px, (min-width: 1024px) 67vw, (min-width: 640px) 50vw, 100vw"
                  : "(min-width: 1248px) 374px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
                className="gallery-photo-image"
              />
              <span className="gallery-photo-caption" aria-hidden="true">
                <span className="gallery-photo-mission-name">{photo.mission}</span>
                <span className="gallery-photo-title">{photo.title}</span>
              </span>
              <span className="gallery-photo-open-icon" aria-hidden="true">↗</span>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      {activeIndex >= 0 && <Lightbox photos={visible} index={activeIndex} onClose={close} onChange={changePhoto} />}
    </section>
  );
}

function Lightbox({ photos, index, onClose, onChange }: {
  photos: GalleryPhoto[];
  index: number;
  onClose: () => void;
  onChange: (direction: number) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();
  const photo = photos[index];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    const previousGutter = root.style.scrollbarGutter;
    const previousBodyOverflow = document.body.style.overflow;

    // Keep scrollbar space so opening a photo never shifts the fixed header.
    root.style.scrollbarGutter = "stable";
    root.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    dialog.showModal();
    closeRef.current?.focus({ preventScroll: true });

    return () => {
      dialog.close();
      root.style.overflow = previousOverflow;
      root.style.scrollbarGutter = previousGutter;
      document.body.style.overflow = previousBodyOverflow;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, []);

  // The native modal traps focus and makes the page behind it inert.
  // This component mounts after a photo click, when document is available.
  return createPortal(
    <dialog
      ref={dialogRef}
      className="gallery-lightbox-dialog"
      aria-labelledby="gallery-lightbox-heading"
      aria-describedby="gallery-lightbox-mission-details gallery-lightbox-keyboard-instructions"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          onChange(event.key === "ArrowRight" ? 1 : -1);
        }
      }}
    >
      <motion.div
        className="enlarged-photo-and-mission-details"
        initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reducedMotion ? 0 : 0.25 }}
      >
        <div className="enlarged-photo-display">
          <AnimatePresence initial={false}>
            <motion.div
              key={photo.id}
              className="enlarged-photo-transition"
              initial={{ opacity: 0, x: reducedMotion ? 0 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: reducedMotion ? 0 : -20 }}
              transition={{ duration: reducedMotion ? 0 : 0.3 }}
            >
              <Image src={photo.src} alt={photo.alt} fill loading="eager" placeholder="blur" sizes="(min-width: 960px) 896px, 100vw" />
            </motion.div>
          </AnimatePresence>
          <button ref={closeRef} type="button" className="gallery-lightbox-close-button" aria-label="Close photo" onClick={onClose}>×</button>
          {photos.length > 1 && (
            <>
              <button type="button" className="gallery-lightbox-previous-button" aria-label="Previous photo" onClick={() => onChange(-1)}>‹</button>
              <button type="button" className="gallery-lightbox-next-button" aria-label="Next photo" onClick={() => onChange(1)}>›</button>
            </>
          )}
        </div>
        <div className="gallery-lightbox-caption" aria-live="polite" aria-atomic="true">
          <div>
            <p id="gallery-lightbox-mission-details" className="gallery-lightbox-mission-location">{photo.mission} / {photo.place}</p>
            <h2 id="gallery-lightbox-heading">{photo.title}</h2>
          </div>
          <p className="gallery-lightbox-photo-position">{index + 1} / {photos.length}</p>
        </div>
        <p id="gallery-lightbox-keyboard-instructions" className="gallery-lightbox-keyboard-help">Use arrow keys to explore · Escape to close</p>
      </motion.div>
    </dialog>,
    document.body,
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
