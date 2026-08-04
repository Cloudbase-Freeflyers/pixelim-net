import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import TrackingPixel from "@/components/TrackingPixel";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Pixelim — Premium Photo Printing",
  description:
    "Acrylic glass, canvas and aluminum photo prints made in our own factory. Crafted to perfection. Made to last.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>
        <noscript>
          {/* Without JS the reveal observer never runs, so force sections visible. */}
          <style>{`.page-anim section,.page-anim footer{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
        <TrackingPixel />
        {children}
      </body>
    </html>
  );
}
