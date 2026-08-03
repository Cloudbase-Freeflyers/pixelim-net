import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Phase 1 is a faithful static port of the original landing pages.
  // The reference `Pixelim Landing Page System` folder is not part of the build.

  // Pin the workspace root to this project (a stray package-lock.json exists
  // higher up in the user's home directory, which Next would otherwise pick).
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
