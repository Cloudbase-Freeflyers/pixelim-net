import type { Metadata } from "next";
import ProductPage from "@/app/components/ProductPage";
import { ACRYLIC } from "@/app/lib/products";

export const metadata: Metadata = {
  title: "Acrylic Photo Prints — Pixelim",
  description:
    "HD printing straight onto acrylic glass — vivid, durable, gallery-grade. From $39, ready in 24–72h.",
};

export default function Page() {
  return <ProductPage product={ACRYLIC} />;
}
