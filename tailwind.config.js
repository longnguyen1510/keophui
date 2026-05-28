/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        appDark: {
          deep: '#070A13',     // Nền siêu tối
          bg: '#0D1222',       // Nền chính
          card: '#161D33',     // Nền card/box
          cardLight: '#212A4A',// Card sáng hơn tí
          border: '#232E52',   // Viền
          muted: '#64748B',    // Chữ mờ
        },
        neon: {
          green: '#10B981',    // Xanh sân bóng cực sáng
          neonGreen: '#34D399',// Xanh sáng rực
          yellow: '#FACC15',   // Vàng neon làm điểm nhấn
          yellowLight: '#FEF08A',
          red: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'slide-up': 'slideUp 0.3s ease-out forwards',
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'ticker': 'ticker 40s linear infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        ticker: {
          '0%': { transform: 'translateX(100vw)' },
          '100%': { transform: 'translateX(-100%)' }
        }
      }
    },
  },
  plugins: [],
}
