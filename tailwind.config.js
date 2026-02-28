/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        euBlue: "#003399", // European Union blue
        euYellow: "#FFCC00", // European Union yellow
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Fraunces", "serif"],
      },
      animation: {
        blob: "blob 7s infinite",
        pulse: "pulse 3s infinite",
        twinkle: "twinkle 3s ease-in-out infinite",
        "fade-in": "fadeIn 0.5s ease-in-out",
        "fade-in-up": "fadeInUp 0.5s ease-in-out",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
        twinkle: {
          "0%, 100%": {
            opacity: 0.8,
            transform: "scale(1) rotate(0deg)",
          },
          "50%": {
            opacity: 1,
            transform: "scale(1.2) rotate(15deg)",
          },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        fadeInUp: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        euromakers: {
          primary: "#003399",
          secondary: "#FFCC00",
          accent: "#2563eb",
          neutral: "#f3f4f6",
          "base-100": "#ffffff",
          "base-200": "#f9fafb",
          "base-300": "#f3f4f6",
          info: "#0ea5e9",
          success: "#10b981",
          warning: "#FFCC00",
          error: "#ef4444",
          // Custom checkbox colors
          "--chkbg": "#FFCC00",
          "--chkfg": "#003399",
        },
      },
    ],
    base: false,
    styled: true,
    utils: true,
    logs: true,
    rtl: false,
    darkTheme: false,
    themeRoot: ":root",
  },
};
