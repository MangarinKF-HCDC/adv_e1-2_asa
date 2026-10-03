import type { StaticImageData } from "next/image";
import launch from "@/public/gallery/launch.webp";
import station from "@/public/gallery/station.webp";
import moon from "@/public/gallery/moon.webp";
import venus from "@/public/gallery/venus.webp";
import docking from "@/public/gallery/iss-docking.webp";
import marsCrew from "@/public/gallery/mars-crew.webp";

export const categories = ["all", "station", "moon", "venus", "mars"] as const;
export type GalleryCategory = typeof categories[number];

export type GalleryPhoto = {
  id: string;
  src: StaticImageData;
  title: string;
  alt: string;
  mission: string;
  place: string;
  category: Exclude<GalleryCategory, "all">;
  span: "tall" | "wide" | "normal";
};

export const photos: GalleryPhoto[] = [
  {
    id: "launch", src: launch, title: "Launch day",
    alt: "An Aurora rocket on its launch pad at sunrise",
    mission: "Liwayway", place: "Launch pad", category: "station", span: "tall",
  },
  {
    id: "station", src: station, title: "Orbital station",
    alt: "An orbital space station above Earth",
    mission: "Liwayway", place: "Low Earth orbit", category: "station", span: "wide",
  },
  {
    id: "moon", src: moon, title: "Crew capsule",
    alt: "A crew capsule traveling above the Moon",
    mission: "Bituin", place: "Lunar orbit", category: "moon", span: "normal",
  },
  {
    id: "venus", src: venus, title: "Research probe",
    alt: "A research probe exploring Venus from orbit",
    mission: "Hiraya", place: "Venus orbit", category: "venus", span: "normal",
  },
  {
    id: "iss-docking", src: docking, title: "Docking at the station",
    alt: "A spacecraft approaching the orbital station for docking",
    mission: "Liwayway", place: "Low Earth orbit", category: "station", span: "normal",
  },
  {
    id: "mars-crew", src: marsCrew, title: "Crew at the outpost",
    alt: "The Aurora crew at an outpost on the surface of Mars",
    mission: "Sinag", place: "Mars outpost", category: "mars", span: "wide",
  },
];
