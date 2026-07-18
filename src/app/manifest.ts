import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SafarSet Recovery Control",
    short_name: "SafarSet",
    description: "Deterministic family travel-disruption recovery demo.",
    start_url: "/",
    display: "standalone",
    background_color: "#06101c",
    theme_color: "#07101c",
    icons: [
      {
        src: "/safarset-icon.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/safarset-icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
