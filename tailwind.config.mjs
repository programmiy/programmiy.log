import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        velog: {
          green: {
            DEFAULT: '#12B886',
            hover: '#20C997',
            light: '#E6FCF5',
            dark: '#0ca678',
          },
          light: {
            bg: '#FFFFFF',
            subBg: '#F8F9FA',
            text1: '#212529',
            text2: '#495057',
            text3: '#868E96',
            border: '#E9ECEF',
          },
          dark: {
            bg: '#121212',
            card: '#1E1E1E',
            text1: '#ECECEC',
            text2: '#D9D9D9',
            text3: '#A0A0A0',
            border: '#2A2A2A',
          },
        },
      },
      fontFamily: {
        sans: [
          'Pretendard Variable',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Roboto',
          'Helvetica Neue',
          'Segoe UI',
          'Apple SD Gothic Neo',
          'Noto Sans KR',
          'Malgun Gothic',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'Consolas',
          'monospace',
        ],
        logo: [
          '"Fira Mono"',
          'monospace',
        ],
      },
    },
  },
  plugins: [typography],
};
