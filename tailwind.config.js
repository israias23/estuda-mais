/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Núcleo da marca "Estuda+": foco, energia e conquista.
        ink: 'rgb(var(--c-ink) / <alpha-value>)',          // texto principal (claro/escuro)
        night: '#15132B',        // superfície escura (sidebar)
        graphite: '#221F3D',     // superfícies escuras secundárias
        violet: {
          DEFAULT: '#5B3FE6',    // marca / foco
          soft: '#7B63F0',
          deep: '#4326C4',
          wash: 'rgb(var(--c-wash) / <alpha-value>)',
          line: '#E5E1F7',
        },
        ember: '#FF6A45',        // ofensiva / energia
        mint: '#13C09A',         // acerto / sucesso
        gold: '#F6B53D',         // conquista / certificado
        sky: '#3C8DFF',          // fórum / informação
        cloud: 'rgb(var(--c-cloud) / <alpha-value>)',        // fundo
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',         // bordas
        slatey: 'rgb(var(--c-slatey) / <alpha-value>)',       // texto secundário
        faint: 'rgb(var(--c-faint) / <alpha-value>)',        // texto terciário
      },
      fontFamily: {
        display: ['Bricolage Grotesque', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        xl2: '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        node: '0 6px 0 0 rgba(20,19,43,0.14)',
        nodeActive: '0 3px 0 0 rgba(20,19,43,0.16)',
        card: '0 10px 30px -14px rgba(27,24,54,0.20)',
        soft: '0 2px 12px -4px rgba(27,24,54,0.10)',
        lift: '0 18px 50px -20px rgba(27,24,54,0.30)',
        glow: '0 0 0 4px rgba(91,63,230,0.12)',
      },
      backgroundImage: {
        'brand': 'linear-gradient(135deg, #5B3FE6 0%, #7B63F0 55%, #6D4BF0 100%)',
        'brand-deep': 'linear-gradient(150deg, #4326C4 0%, #5B3FE6 60%, #7B63F0 100%)',
        'mesh': 'radial-gradient(120% 120% at 0% 0%, rgba(123,99,240,0.22), transparent 45%), radial-gradient(120% 120% at 100% 0%, rgba(255,106,69,0.16), transparent 45%), radial-gradient(120% 120% at 100% 100%, rgba(19,192,154,0.14), transparent 45%)',
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '60%': { transform: 'scale(1.04)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        rise: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        flame: {
          '0%,100%': { transform: 'scale(1) rotate(-2deg)' },
          '50%': { transform: 'scale(1.08) rotate(2deg)' },
        },
        fade: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        sheet: {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        drawline: { '0%': { strokeDashoffset: '1' }, '100%': { strokeDashoffset: '0' } },
        spinslow: { '100%': { transform: 'rotate(360deg)' } },
      },
      animation: {
        pop: 'pop 0.35s cubic-bezier(0.18,0.89,0.32,1.28)',
        rise: 'rise 0.45s ease-out both',
        flame: 'flame 1.6s ease-in-out infinite',
        fade: 'fade 0.25s ease-out both',
        sheet: 'sheet 0.3s cubic-bezier(0.18,0.89,0.32,1.28) both',
        floaty: 'floaty 3.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
