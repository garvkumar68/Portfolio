module.exports = {
  corePlugins: {
    preflight: false, // Prevents tailwind from resetting Bootstrap styles
  },
  content: [
    "./src/components/admin/**/*.{js,jsx,ts,tsx}",
    "./src/components/AdminPage.tsx",
  ],
  theme: {
    extend: {
      colors: {
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
      }
    },
  },
  plugins: [],
}
