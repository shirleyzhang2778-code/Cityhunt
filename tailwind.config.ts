import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F9FAFB",
        card: "#FFFFFF",
        primary: {
          DEFAULT: "#1F2937",
          foreground: "#FFFFFF",
        },
        secondary: "#4B5563",
        muted: "#9CA3AF",
        border: "#E5E7EB",
        success: "#10B981",
        danger: "#EF4444",
        star: "#FBBF24",
      },
      fontFamily: {
        burmese: ["var(--font-burmese)", "Pyidaungsu", "Noto Sans Myanmar", "sans-serif"],
      },
      borderRadius: {
        card: "24px",
        button: "12px",
      },
      height: {
        tabbar: "64px",
      },
    },
  },
  plugins: [],
};

export default config;
