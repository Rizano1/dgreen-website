import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Serif_Display, Jost } from "next/font/google";
import { SmoothScroll } from "@/components/SmoothScroll";
import "./globals.css";

const display = DM_Serif_Display({ variable: "--font-display", subsets: ["latin"], weight: "400" });
const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
});
const sans = Jost({ variable: "--font-sans", subsets: ["latin"], weight: ["300", "400", "500"] });

export const metadata: Metadata = {
  title: "D'Green Resto & Coffee — Pause, Relax, Linger",
  description: "D'Green Resto & Coffee, Jl. Selabintana No.54, Sukabumi. Pause, relax, linger.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${serif.variable} ${sans.variable}`}>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
