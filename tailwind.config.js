const { colors } = require("tailwindcss/defaultTheme");

module.exports = {
  purge: {
    mode: "all",
    content: ["./**/*.html"],
    options: {
      whitelist: [],
    },
  },
  theme: {
    backgroundImage:  {
      'blackgrit': "url('/static/theme/blackgrit.png')",
      'whitegrit': "url('/static/theme/whitegrit-2.png')",
      'hops': "url('/static/theme/hops.jpg')",
      'hops-green-grit': "url('/static/theme/hops-green-grit.jpg')",
      'hops-green-muted': "url('/static/theme/hops-green-muted.jpg')",
      'hops-gradient': "linear-gradient(to top, rgba(146, 187, 5, 1), rgba(146, 187, 5, 0) ), url('/static/theme/hops-green-grit.jpg')",
    },
    borderWidth: {
      'thin': '1px',
      '4': '4px',
    },
    container: {
      center: true,
    },
    colors: {
      lime: '#92BB05',
      pine: '#284900',
      orange: '#F19702',
      white: colors.white,
      black: '#252821',
      beige: '#F4EFE4'
    },
    fontFamily: {
      'display': ['Alfa Slab One'],
      'body': ['Roboto']
    },
    extend: {
      boxShadow: {
        'offset-white': '6px 6px 0 0 rgba(255, 255, 255, 0.4)',
      },
      fontSize: {
        '7xl': '5rem',
      },
      padding: {
        '10vh': '10vh',
        '20vw': '20vw',
      }
    }
  },
  variants: {},
  plugins: [require("@tailwindcss/typography")],
};
