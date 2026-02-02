/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      screens: {
        mobile: '375px', // mobile 기준
        tablet: '768px',
        desktop: '1440px',
      },
      colors: {
        // primitive
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
        },
        gray: {
          50: 'var(--color-gray-50)',
          100: 'var(--color-gray-100)',
          200: 'var(--color-gray-200)',
          300: 'var(--color-gray-300)',
          400: 'var(--color-gray-400)',
          500: 'var(--color-gray-500)',
          600: 'var(--color-gray-600)',
          700: 'var(--color-gray-700)',
          800: 'var(--color-gray-800)',
          900: 'var(--color-gray-900)',
        },

        interaction: {
          normal: 'var(--interaction-normal)',
          hover: 'var(--interaction-hover)',
          active: 'var(--interaction-active)',
          disable: 'var(--interaction-disable)',
        },
        label: {
          normal: 'var(--label-normal)',
          neutral: 'var(--label-neutral)',
          assistive: 'var(--label-assistive)',
          disable: 'var(--label-disable)',
          primary: 'var(--label-primary)',
          inverse: 'var(--label-inverse)',
        },

        line: {
          normal: 'var(--line-normal)',
          focus: 'var(--line-focus)',
          active: 'var(--line-active)',
          negative: 'var(--line-negative)',
        },
        system: {
          red: 'var(--system-red)',
        },
        
        background: {
          blue: 'var(--background-blue)',
          neutral: 'var(--background-neutral)',
          active: 'var(--background-active)',
          red: 'var(--background-red)',
        },
        chip: {
          blue: 'var(--chip-blue)',
          gray: 'var(--chip-gray)',
          pink: 'var(--chip-pink)',
          orange: 'var(--chip-orange)',
          green: 'var(--chip-green)',
        },
      },

      fontFamily: {
        sans: 'var(--font-sans)',
      },

      fontSize: {
        // [size, { lineHeight, letterSpacing, fontWeight }]
        h1: [
          'var(--fs-h1)',
          {
            lineHeight: 'var(--lh-h1)',
            letterSpacing: 'var(--ls-h1)',
            fontWeight: 'var(--fw-h1)',
          },
        ],
        'title-1': [
          'var(--fs-title1)',
          {
            lineHeight: 'var(--lh-title1)',
            letterSpacing: 'var(--ls-title1)',
            fontWeight: 'var(--fw-title1)',
          },
        ],
        'title-2b': [
          'var(--fs-title2-b)',
          {
            lineHeight: 'var(--lh-title2-b)',
            letterSpacing: 'var(--ls-title2-b)',
            fontWeight: 'var(--fw-title2-b)',
          },
        ],
        'title-2m': [
          'var(--fs-title2-m)',
          {
            lineHeight: 'var(--lh-title2-m)',
            letterSpacing: 'var(--ls-title2-m)',
            fontWeight: 'var(--fw-title2-m)',
          },
        ],
        'body-1sb': [
          'var(--fs-body1-sb)',
          {
            lineHeight: 'var(--lh-body1-sb)',
            letterSpacing: 'var(--ls-body1-sb)',
            fontWeight: 'var(--fw-body1-sb)',
          },
        ],
        'body-1': [
          'var(--fs-body1-r)',
          {
            lineHeight: 'var(--lh-body1-r)',
            letterSpacing: 'var(--ls-body1-r)',
            fontWeight: 'var(--fw-body1-r)',
          },
        ],
        'body-1rd': [
          'var(--fs-body1-rd)',
          {
            lineHeight: 'var(--lh-body1-rd)',
            letterSpacing: 'var(--ls-body1-rd)',
            fontWeight: 'var(--fw-body1-rd)',
          },
        ],
        'body-2sb': [
          'var(--fs-body2-sb)',
          {
            lineHeight: 'var(--lh-body2-sb)',
            letterSpacing: 'var(--ls-body2-sb)',
            fontWeight: 'var(--fw-body2-sb)',
          },
        ],
        'body-2': [
          'var(--fs-body2-r)',
          {
            lineHeight: 'var(--lh-body2-r)',
            letterSpacing: 'var(--ls-body2-r)',
            fontWeight: 'var(--fw-body2-r)',
          },
        ],
        caption: [
          'var(--fs-caption)',
          {
            lineHeight: 'var(--lh-caption)',
            letterSpacing: 'var(--ls-caption)',
            fontWeight: 'var(--fw-caption)',
          },
        ],
        'title1-bold': [
          'var(--fs-title1)',
          {
            lineHeight: 'var(--lh-title1)',
            letterSpacing: 'var(--ls-title1)',
            fontWeight: 'var(--fw-title1)',
          },
        ],
        'caption-regular': [
          'var(--fs-caption)',
          {
            lineHeight: 'var(--lh-caption)',
            letterSpacing: 'var(--ls-caption)',
            fontWeight: 'var(--fw-caption-r)',
          },
        ],
      },
    },
  },
  plugins: [],
}
