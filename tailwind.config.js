/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./resources/js/**/*.{js,ts,jsx,tsx}",
    "./resources/views/**/*.blade.php",
  ],
  theme: {
    extend: {
      colors: {
        // Use flat names that Tailwind can recognize
        'slate-900': '#0f1117',
        'slate-800': '#181c27',
        'slate-700': '#1e2333',
        'slate-600': '#252b3b',
        'slate-550': '#2a3045',
        'slate-400': '#2e3549',
        'slate-300': '#3d4666',
        
        'stone-100': '#f0f2f8',
        'stone-300': '#8892a4',
        'stone-400': '#4e5770',
        
        'orange-primary': '#f97316',
        'orange-light': '#7c3a0f',
        'orange-hover': '#fb923c',
        
        'red-status': '#ef4444',
        'red-status-bg': '#450a0a',
        'green-status': '#22c55e',
        'green-status-bg': '#052e16',
        'amber-status': '#f59e0b',
        'amber-status-bg': '#431407',
        
        'rose-danger': '#f43f5e',
        'rose-danger-bg': '#4c0519',
      },
      
      fontFamily: {
        body: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      
      fontSize: {
        '2xs': '0.625rem',
      },
    },
  },
  plugins: [],
}
