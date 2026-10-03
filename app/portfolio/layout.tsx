import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Explore Liwayway, Bituin, Hiraya, and Sinag: four Aurora missions taking us from the International Space Station to Mars.",
};

export default function PortfolioLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
