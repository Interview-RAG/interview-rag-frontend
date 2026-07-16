/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotateX(2deg) rotateY(-5deg)' },
          '50%': { transform: 'translateY(-15px) rotateX(4deg) rotateY(-2deg)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translateY(0) rotateX(2deg) rotateY(5deg)' },
          '50%': { transform: 'translateY(-12px) rotateX(0deg) rotateY(8deg)' },
        },
        orbPulse: {
          '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: '0.4' },
          '50%': { transform: 'translate(-50%, -50%) scale(1.1)', opacity: '0.6' },
        }
      },
      animation: {
        'float-1': 'float 6s ease-in-out infinite',
        'float-2': 'floatReverse 7s ease-in-out infinite 1s',
        'float-3': 'float 8s ease-in-out infinite 2s',
        'float-4': 'floatReverse 6.5s ease-in-out infinite 1.5s',
        'orb': 'orbPulse 8s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
