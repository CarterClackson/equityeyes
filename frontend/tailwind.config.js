/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}", ],
  theme: {
    extend: {
      backgroundImage: theme => ({
        'section': "url('/public/assets/images/home-bg.jpg')",
      }),
      overlayColor: theme => ({
        'black-50': 'rgba(0, 0, 0, 0.5)',
      }),
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    function ({ addUtilities }) {
      const newUtilities = {
        '.bg-black-50': {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
        },
      };
      addUtilities(newUtilities, ['responsive', 'hover']);
    },
  ],
  purge: {
    content: ["./src/**/*.{html,js}", "./public/index.html"],
    safelist: ["bg-section", "bg-black-50"],
  },
}

