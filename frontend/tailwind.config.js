/** @type {import('tailwindcss').Config} */
export default {
   content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
   theme: {
      extend: {
         colors:{
            'background': '#fafafa',
            'primary': '#7600BC',
            'secondary': '#D1D5D8',
            'primarydark': '#0054B3',
            'primarylight':'#cae1fa',
         }

      },
   },
   plugins: [],
};
