import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CRAVE — What's the campus craving?",
    short_name: "CRAVE",
    description: "Find it. Grab it. Get back to life. Campus food ordering with pickup slots and live tracking.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFF9F0",
    theme_color: "#171111",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
