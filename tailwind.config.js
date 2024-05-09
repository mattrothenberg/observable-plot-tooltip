const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gray: generateRadixColorScale("gray"),
        green: generateRadixColorScale("green"),
        red: generateRadixColorScale("red"),
        blue: generateRadixColorScale("indigo"),
      },
      fontFamily: {
        sans: ["Readex Pro", ...defaultTheme.fontFamily.sans],
      }
    },
  },
  plugins: [],
}


function generateRadixColorScale(name) {
  const scale = Array.from({ length: 12 }, (_, i) => {
    const id = i + 1;
    return [
      [id, `var(--${name}-${id})`],
      [`a${id}`, `var(--${name}-a${id})`],
    ];
  }).flat();

  return Object.fromEntries(scale);
}
