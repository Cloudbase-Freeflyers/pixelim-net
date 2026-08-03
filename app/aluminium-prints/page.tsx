import type { Metadata } from "next";
import ProductPage from "@/app/components/ProductPage";
import { ALUMINIUM } from "@/app/lib/products";

export const metadata: Metadata = {
  title: "Aluminum Prints — Pixelim",
  description:
    "Photos fused into slim, weatherproof metal — sharp and impossibly thin. From $45, ready in 24–72h.",
};

export default function Page() {
  return <ProductPage product={ALUMINIUM} />;
}
