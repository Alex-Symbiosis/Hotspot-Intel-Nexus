import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          bg: "#fbfbfd",
          card: "#ffffff",
          text: "#1d1d1f",
          secondary: "#86868b",
          border: "#d2d2d7",
          accent: "#0071e3",
          highlight: "#e8f0fe",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system", "BlinkMacSystemFont", "Segoe UI",
          "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei",
          "Helvetica Neue", "Helvetica", "Arial", "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
