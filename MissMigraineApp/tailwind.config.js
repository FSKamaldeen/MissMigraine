/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        wisteria: {
          50: "#f1ebf9",
          100: "#e4d8f3",
          200: "#c8b0e8",
          300: "#ad89dc",
          400: "#9262d0",
          500: "#763bc4",
          600: "#5f2f9d",
          700: "#472376",
          800: "#2f174f",
          900: "#211136",
          950: "#11081b"
        },

        background: '#11081b',
        surface:    '#211136',
        elevated:   '#2f174f',

        text: {
          primary:   '#f1ebf9',
          secondary: '#c8b0e8',
          muted:     '#ad89dc',
          inverse:   '#11081b',
        },
        
        border: {
          DEFAULT: '#2f174f',
          strong:  '#472376',
        },

        brand: {
          DEFAULT: '#ad89dc',
          dark:    '#472376',
          light:   '#c8b0e8',
        },

        cycle: {
          menstrual:  '#7F011F',
          follicular: '#B81B3B',
          ovulatory:  '#D9455F',
          luteal:     '#E87A8E',
        },

        danger:  '#a01717',
        success: '#6ca45b',
        warning: '#ffe162',
      },
      
      fontFamily: {
        reem:           ['ReemKufi-Bold'],
        plein:          ['Plein-Regular'],
        'plein-light':  ['Plein-Light'],
        'plein-medium': ['Plein-Medium'],
      },
    },
  },
  plugins: [],
};
