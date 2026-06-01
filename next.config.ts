import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Output ────────────────────────────────────────────────────────────────
  // Required for Docker / Google Cloud Run deployment.
  // Produces a self-contained `.next/standalone` directory.
  output: "standalone",

  // ── Images ────────────────────────────────────────────────────────────────
  // The <Image> component in FieldReportsTab uses URL.createObjectURL()
  // which produces same-origin blob: URLs — no remote domain needed there.
  // remotePatterns is defined here for completeness and future use.
  images: {
    remotePatterns: [
      // Allow Google Maps static/street-view image assets if ever used
      // directly via <Image> (the current iframe embed doesn't need this).
      {
        protocol: "https",
        hostname: "maps.googleapis.com",
      },
      // Allow Supabase storage bucket images if field reports are stored there
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },

  // ── Client-side environment variables ────────────────────────────────────
  // Variables prefixed with NEXT_PUBLIC_ are already inlined by Next.js at
  // build time without any extra config.  The block below makes the full set
  // explicit and visible for documentation / CI purposes.
  //
  // Server-only keys (GOOGLE_GENERATIVE_AI_API_KEY, FIREBASE_*, etc.) are
  // NOT listed here — they must only live in process.env on the server and
  // must never be sent to the browser.
  env: {
    // Supabase — browser-safe (enforces Row Level Security)
    NEXT_PUBLIC_SUPABASE_URL:      process.env.NEXT_PUBLIC_SUPABASE_URL      ?? "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  },
};

export default nextConfig;
