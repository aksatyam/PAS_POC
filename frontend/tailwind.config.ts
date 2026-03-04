import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './design-system/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ── Colors (Design System Tokens) ─────────────────────────
      colors: {
        // Primary: Deep Blue — Trust, Insurance authority
        primary: {
          50: '#EEF2F7', 100: '#D4DFEB', 200: '#A9BFDA', 300: '#7E9FC8',
          400: '#537FB5', 500: '#1E3A5F', 600: '#1A3354', 700: '#152B48',
          800: '#10223A', 900: '#0B192C', 950: '#060E1A',
        },
        // Secondary: Teal — Modernity, Growth
        secondary: {
          50: '#F0FDFA', 100: '#CCFBF1', 200: '#99F6E4', 300: '#5EEAD4',
          400: '#2DD4BF', 500: '#0D9488', 600: '#0B7C72', 700: '#09655C',
          800: '#074E47', 900: '#053731', 950: '#031F1C',
        },
        // Accent: Amber — Alerts, CTAs
        accent: {
          50: '#FFFBEB', 100: '#FEF3C7', 200: '#FDE68A', 300: '#FCD34D',
          400: '#FBBF24', 500: '#F59E0B', 600: '#D97706', 700: '#B45309',
          800: '#92400E', 900: '#78350F', 950: '#451A03',
        },
        // Neutral scale
        neutral: {
          50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1',
          400: '#94A3B8', 500: '#64748B', 600: '#475569', 700: '#334155',
          800: '#1E293B', 900: '#0F172A', 950: '#020617',
        },
        // Semantic
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        // Surfaces
        surface: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          sidebar: '#1E293B',
          elevated: '#FFFFFF',
          muted: '#F1F5F9',
          border: '#E2E8F0',
        },
        // IMGC Brand (legacy compat)
        imgc: {
          orange: '#E67E22',
          'orange-dark': '#D35400',
          'orange-light': '#F39C12',
          blue: '#2196F3',
          'blue-dark': '#1976D2',
          navy: '#1a2332',
          'navy-light': '#2c3e50',
          gray: '#f5f6fa',
          'gray-medium': '#ecf0f1',
        },
        'pas-navy': '#1a2332',
      },

      // ── Typography ────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'Consolas', 'monospace'],
      },
      fontSize: {
        'display': ['clamp(2rem, 2.5vw, 3rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'h1': ['clamp(1.75rem, 2vw, 2.25rem)', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'h2': ['clamp(1.375rem, 1.6vw, 1.75rem)', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        'h3': ['clamp(1.125rem, 1.3vw, 1.375rem)', { lineHeight: '1.3', letterSpacing: '-0.005em' }],
        'h4': ['clamp(1rem, 1.1vw, 1.125rem)', { lineHeight: '1.35' }],
        'h5': ['0.9375rem', { lineHeight: '1.4' }],
        'h6': ['0.8125rem', { lineHeight: '1.5', letterSpacing: '0.05em' }],
        'body-lg': ['1.0625rem', { lineHeight: '1.6' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.8125rem', { lineHeight: '1.4', letterSpacing: '0.01em' }],
        'small': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.01em' }],
        'data': ['0.875rem', { lineHeight: '1.4' }],
        'data-lg': ['clamp(1.5rem, 2vw, 2rem)', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'code': ['0.8125rem', { lineHeight: '1.5' }],
        'overline': ['0.6875rem', { lineHeight: '1.5', letterSpacing: '0.1em' }],
      },

      // ── Spacing (4px base unit) ───────────────────────────────
      spacing: {
        '0.5': '2px',
        '1': '4px',
        '1.5': '6px',
        '2': '8px',
        '2.5': '10px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '9': '36px',
        '10': '40px',
        '11': '44px',
        '12': '48px',
        '14': '56px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
        '28': '112px',
        '32': '128px',
        'sidebar': '260px',
        'sidebar-collapsed': '72px',
        'topbar': '56px',
        'contextbar': '40px',
        'statusbar': '32px',
      },

      // ── Max Width ─────────────────────────────────────────────
      maxWidth: {
        'content': '1440px',
        'content-inner': '1280px',
      },

      // ── Border Radius ─────────────────────────────────────────
      borderRadius: {
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
        '2xl': '16px',
      },

      // ── Shadows (Elevation System) ────────────────────────────
      boxShadow: {
        // Legacy compat
        'enterprise': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
        'enterprise-md': '0 2px 6px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)',
        // Elevation system
        'elevation-0': 'none',
        'elevation-1': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'elevation-2': '0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
        'elevation-3': '0 8px 24px rgba(0,0,0,0.14), 0 4px 8px rgba(0,0,0,0.08)',
        'elevation-4': '0 16px 48px rgba(0,0,0,0.18), 0 8px 16px rgba(0,0,0,0.1)',
        'elevation-inner': 'inset 0 2px 4px rgba(0,0,0,0.06)',
        'focus-ring': '0 0 0 2px #1E3A5F, 0 0 0 4px rgba(30,58,95,0.3)',
        'focus-ring-dark': '0 0 0 2px #5EEAD4, 0 0 0 4px rgba(94,234,212,0.3)',
        'focus-error': '0 0 0 2px #EF4444, 0 0 0 4px rgba(239,68,68,0.3)',
        'glow-success': '0 0 12px rgba(16,185,129,0.4)',
        'glow-warning': '0 0 12px rgba(245,158,11,0.4)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08)',
      },

      // ── Z-Index Scale ─────────────────────────────────────────
      zIndex: {
        'dropdown': '10',
        'sticky': '20',
        'header': '30',
        'sidebar': '35',
        'overlay': '40',
        'modal': '50',
        'popover': '60',
        'toast': '70',
        'tooltip': '80',
        'command': '90',
      },

      // ── Animations ────────────────────────────────────────────
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeOut: {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideOutRight: {
          from: { opacity: '1', transform: 'translateX(0)' },
          to: { opacity: '0', transform: 'translateX(16px)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.85)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
        countUp: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'fade-out': 'fadeOut 150ms ease-in',
        'slide-up': 'slideUp 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-down': 'slideDown 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-right': 'slideInRight 350ms cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-out-right': 'slideOutRight 200ms ease-in forwards',
        'scale-in': 'scaleIn 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        'shimmer': 'shimmer 1.5s linear infinite',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
        'pulse-dot': 'pulseDot 1.5s ease-in-out infinite',
        'shake': 'shake 350ms cubic-bezier(0.4, 0, 0.2, 1)',
        'count-up': 'countUp 250ms cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // ── Transition ────────────────────────────────────────────
      transitionDuration: {
        'micro': '150ms',
        'fast': '200ms',
        'standard': '250ms',
        'emphasis': '350ms',
        'slow': '500ms',
      },
      transitionTimingFunction: {
        'ease-out-custom': 'cubic-bezier(0.0, 0, 0.2, 1)',
        'ease-in-custom': 'cubic-bezier(0.4, 0, 1, 1)',
        'emphasis': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};
export default config;
