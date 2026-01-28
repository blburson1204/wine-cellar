/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        wine: {
          dark: '#3d010b',
          burgundy: '#7C2D3C',
          background: '#221a13',
          surface: '#282f20',
          header: '#09040a',
          input: '#443326',
          hover: '#5a0210',
        },
      },
    },
  },
  plugins: [],
};
