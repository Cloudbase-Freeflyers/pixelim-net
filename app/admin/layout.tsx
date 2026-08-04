import type { Metadata } from "next";
import { Assistant } from "next/font/google";
import "./admin.css";

const assistant = Assistant({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = { title: "Pixelim Admin" };

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${assistant.className} min-h-screen bg-gray-50 text-gray-900`}>
      {children}
    </div>
  );
}
