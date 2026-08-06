// Vite does not run PostCSS implicitly the way CRA did, so the plugin chain has
// to be declared for Tailwind to be processed at all.
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
