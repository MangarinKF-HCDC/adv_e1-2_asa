import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "About",
  description: "Meet Aurora Space Agency's crew and discover the curiosity, courage, and bayanihan behind our missions.",
};

export default function AboutLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
