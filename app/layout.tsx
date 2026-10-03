import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import Header, { RouteTransitionProvider } from "@/components/Header";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Aurora Space Agency", template: "%s | Aurora Space Agency" },
  description: "Missions, crew, and views from beyond Earth. Follow Aurora Space Agency as we reach beyond the horizon.",
  icons: {
    icon: { url: "/aurora-logo.svg", type: "image/svg+xml", sizes: "any" },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable}`}>
      <body>
        <RouteTransitionProvider>
        <a href="#agency-information" className="skip-to-agency-information">Skip to content</a>
        <Header />
        <main id="agency-information" tabIndex={-1}>{children}</main>
        </RouteTransitionProvider>
      </body>
    </html>
  );
}
