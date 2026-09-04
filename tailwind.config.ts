import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-playfair)', 'serif'],
        heading: ['var(--font-playfair)', 'serif'],
        playfair: ['var(--font-playfair)', 'serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gold-brass':
          'linear-gradient(135deg, #E5B842 0%, #FFF3C4 30%, #D4AF37 65%, #C5992B 100%)',
        'tharika-gold-gradient':
          'linear-gradient(135deg, #E5B842 0%, #FFF3C4 30%, #D4AF37 65%, #C5992B 100%)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        // Custom Exact Tharika Decors Radiant Design System
        'tharika-blue': '#0B2B4A',
        'tharika-sapphire': '#0B2B4A',
        'tharika-navy': '#071A2E',
        'tharika-navy-light': '#163859',
        'tharika-green': '#0D6E51',
        'tharika-cream': '#FCFAF7',
        'tharika-alabaster': '#FCFAF7',
        'tharika-gold': '#D4AF37',
        'tharika-champagne': '#E5B842',
        'tharika-gold-dark': '#B8860B',
        tharika: {
          'off-white': '#FCFAF7',
          alabaster: '#FCFAF7',
          'peacock-blue': '#0B2B4A',
          sapphire: '#0B2B4A',
          navy: '#071A2E',
          'navy-light': '#163859',
          'emerald-green': '#0D6E51',
          blue: '#0B2B4A',
          green: '#0D6E51',
          cream: '#FCFAF7',
          gold: '#D4AF37',
          champagne: '#E5B842',
          'gold-dark': '#B8860B',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
