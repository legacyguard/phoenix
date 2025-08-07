/**
 * Professional Tailwind Preset
 * Extends Tailwind with professional, non-gamified design tokens
 */

module.exports = {
  theme: {
    extend: {
      colors: {
        // Professional Primary Palette
        'prof-primary': {
          50: 'var(--professional-primary-50)',
          100: 'var(--professional-primary-100)',
          200: 'var(--professional-primary-200)',
          300: 'var(--professional-primary-300)',
          400: 'var(--professional-primary-400)',
          500: 'var(--professional-primary-500)',
          600: 'var(--professional-primary-600)',
          700: 'var(--professional-primary-700)',
          800: 'var(--professional-primary-800)',
          900: 'var(--professional-primary-900)',
          950: 'var(--professional-primary-950)',
        },
        
        // Professional Secondary Palette
        'prof-secondary': {
          50: 'var(--professional-secondary-50)',
          100: 'var(--professional-secondary-100)',
          200: 'var(--professional-secondary-200)',
          300: 'var(--professional-secondary-300)',
          400: 'var(--professional-secondary-400)',
          500: 'var(--professional-secondary-500)',
          600: 'var(--professional-secondary-600)',
          700: 'var(--professional-secondary-700)',
          800: 'var(--professional-secondary-800)',
          900: 'var(--professional-secondary-900)',
          950: 'var(--professional-secondary-950)',
        },
        
        // Status Colors
        'prof-complete': 'var(--professional-status-complete)',
        'prof-in-progress': 'var(--professional-status-in-progress)',
        'prof-needs-review': 'var(--professional-status-needs-review)',
        'prof-not-started': 'var(--professional-status-not-started)',
        
        // Priority Colors
        'prof-urgent': 'var(--professional-priority-urgent)',
        'prof-high': 'var(--professional-priority-high)',
        'prof-medium': 'var(--professional-priority-medium)',
        'prof-low': 'var(--professional-priority-low)',
        
        // Semantic Colors
        'prof-success': 'var(--professional-success)',
        'prof-success-light': 'var(--professional-success-light)',
        'prof-success-dark': 'var(--professional-success-dark)',
        'prof-warning': 'var(--professional-warning)',
        'prof-warning-light': 'var(--professional-warning-light)',
        'prof-warning-dark': 'var(--professional-warning-dark)',
        'prof-error': 'var(--professional-error)',
        'prof-error-light': 'var(--professional-error-light)',
        'prof-error-dark': 'var(--professional-error-dark)',
        'prof-info': 'var(--professional-info)',
        'prof-info-light': 'var(--professional-info-light)',
        'prof-info-dark': 'var(--professional-info-dark)',
      },
      
      fontFamily: {
        'prof-sans': 'var(--professional-font-sans)',
        'prof-serif': 'var(--professional-font-serif)',
        'prof-mono': 'var(--professional-font-mono)',
      },
      
      fontSize: {
        'prof-xs': 'var(--professional-text-xs)',
        'prof-sm': 'var(--professional-text-sm)',
        'prof-base': 'var(--professional-text-base)',
        'prof-lg': 'var(--professional-text-lg)',
        'prof-xl': 'var(--professional-text-xl)',
        'prof-2xl': 'var(--professional-text-2xl)',
        'prof-3xl': 'var(--professional-text-3xl)',
        'prof-4xl': 'var(--professional-text-4xl)',
        'prof-5xl': 'var(--professional-text-5xl)',
      },
      
      spacing: {
        'prof-0': 'var(--professional-space-0)',
        'prof-1': 'var(--professional-space-1)',
        'prof-2': 'var(--professional-space-2)',
        'prof-3': 'var(--professional-space-3)',
        'prof-4': 'var(--professional-space-4)',
        'prof-5': 'var(--professional-space-5)',
        'prof-6': 'var(--professional-space-6)',
        'prof-8': 'var(--professional-space-8)',
        'prof-10': 'var(--professional-space-10)',
        'prof-12': 'var(--professional-space-12)',
        'prof-16': 'var(--professional-space-16)',
        'prof-20': 'var(--professional-space-20)',
        'prof-24': 'var(--professional-space-24)',
        'prof-32': 'var(--professional-space-32)',
      },
      
      borderRadius: {
        'prof-none': 'var(--professional-radius-none)',
        'prof-sm': 'var(--professional-radius-sm)',
        'prof': 'var(--professional-radius-base)',
        'prof-md': 'var(--professional-radius-md)',
        'prof-lg': 'var(--professional-radius-lg)',
        'prof-xl': 'var(--professional-radius-xl)',
        'prof-2xl': 'var(--professional-radius-2xl)',
        'prof-3xl': 'var(--professional-radius-3xl)',
        'prof-full': 'var(--professional-radius-full)',
      },
      
      boxShadow: {
        'prof-xs': 'var(--professional-shadow-xs)',
        'prof-sm': 'var(--professional-shadow-sm)',
        'prof': 'var(--professional-shadow-base)',
        'prof-md': 'var(--professional-shadow-md)',
        'prof-lg': 'var(--professional-shadow-lg)',
        'prof-xl': 'var(--professional-shadow-xl)',
        'prof-2xl': 'var(--professional-shadow-2xl)',
        'prof-inner': 'var(--professional-shadow-inner)',
        'prof-focus': 'var(--professional-shadow-focus)',
        'prof-focus-error': 'var(--professional-shadow-focus-error)',
        'prof-focus-success': 'var(--professional-shadow-focus-success)',
        'prof-none': 'none',
      },
      
      transitionDuration: {
        'prof-fast': 'var(--professional-transition-fast)',
        'prof': 'var(--professional-transition-base)',
        'prof-slow': 'var(--professional-transition-slow)',
        'prof-slower': 'var(--professional-transition-slower)',
      },
      
      transitionTimingFunction: {
        'prof-in': 'var(--professional-ease-in)',
        'prof-out': 'var(--professional-ease-out)',
        'prof-in-out': 'var(--professional-ease-in-out)',
        'prof-bounce': 'var(--professional-ease-bounce)',
      },
      
      zIndex: {
        'prof-base': 'var(--professional-z-base)',
        'prof-dropdown': 'var(--professional-z-dropdown)',
        'prof-sticky': 'var(--professional-z-sticky)',
        'prof-fixed': 'var(--professional-z-fixed)',
        'prof-modal-backdrop': 'var(--professional-z-modal-backdrop)',
        'prof-modal': 'var(--professional-z-modal)',
        'prof-popover': 'var(--professional-z-popover)',
        'prof-tooltip': 'var(--professional-z-tooltip)',
        'prof-notification': 'var(--professional-z-notification)',
      },
      
      screens: {
        'prof-xs': 'var(--professional-screen-xs)',
        'prof-sm': 'var(--professional-screen-sm)',
        'prof-md': 'var(--professional-screen-md)',
        'prof-lg': 'var(--professional-screen-lg)',
        'prof-xl': 'var(--professional-screen-xl)',
        'prof-2xl': 'var(--professional-screen-2xl)',
      },
      
      animation: {
        'prof-fade-in': 'profFadeIn 0.5s ease-out',
        'prof-slide-up': 'profSlideUp 0.3s ease-out',
        'prof-slide-down': 'profSlideDown 0.3s ease-out',
        'prof-scale-in': 'profScaleIn 0.2s ease-out',
        'prof-pulse-subtle': 'profPulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      
      keyframes: {
        profFadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        profSlideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        profSlideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        profScaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        profPulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  
  plugins: [
    // Custom utilities for professional design
    function({ addUtilities }) {
      const newUtilities = {
        '.prof-text-gradient': {
          background: 'linear-gradient(135deg, var(--professional-primary-600) 0%, var(--professional-primary-400) 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.prof-glass': {
          background: 'rgba(255, 255, 255, 0.7)',
          'backdrop-filter': 'blur(10px)',
          '-webkit-backdrop-filter': 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.prof-glass-dark': {
          background: 'rgba(17, 24, 39, 0.7)',
          'backdrop-filter': 'blur(10px)',
          '-webkit-backdrop-filter': 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.prof-card-interactive': {
          transition: 'all var(--professional-transition-base) var(--professional-ease-in-out)',
          '&:hover': {
            transform: 'translateY(-2px)',
            'box-shadow': 'var(--professional-shadow-lg)',
          },
        },
        '.prof-focus-ring': {
          '&:focus-visible': {
            outline: 'none',
            'box-shadow': 'var(--professional-shadow-focus)',
          },
        },
      };
      
      addUtilities(newUtilities);
    },
  ],
};
