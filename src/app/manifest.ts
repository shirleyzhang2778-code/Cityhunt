import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "缅甸语背单词",
    short_name: "缅语背词",
    description: "缅甸语专业学习者背诵工具",
    start_url: "/",
    display: "standalone",
    background_color: "#F9FAFB",
    theme_color: "#FFFFFF",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
