import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Explore six Aurora Space Agency mission photos, from the launch pad and lunar orbit to our Mars outpost.",
};

export default function GalleryLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
