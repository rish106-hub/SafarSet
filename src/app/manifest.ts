import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SafarSet Recovery Control",
    short_name: "SafarSet",
    description: "Private travel monitoring and recovery control for families.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7fafc",
    theme_color: "#102a43",
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
