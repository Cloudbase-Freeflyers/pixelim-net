import type { Metadata } from "next";
import ProductPage from "@/app/components/ProductPage";
import { CANVAS } from "@/app/lib/products";

export const metadata: Metadata = {
  title: "Canvas Prints — Pixelim",
  description:
    "Rich pigment inks on woven cotton canvas — warm, textured, gallery-wrapped. From $29, ready in 24–72h.",
};

export default function Page() {
  return <ProductPage product={CANVAS} />;
}
