import type { Config } from "tailwindcss";

export default {
	darkMode: "class",
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'sans': ['Inter', 'system-ui', 'sans-serif'],
				'serif': ['Georgia', 'serif'],
				'heritage': ['Georgia', 'serif'], // For quotes and special content
			},
			colors: {
				// Layered & Professional - Light Mode
				// Backgrounds
				'background': '#F9F6F2', // Soft, warm off-white for the main page background
				'foreground': '#2D2D2D', // Default text color
				'sidebar': '#FFFFFF', // Clean, pure white for the sidebar
				'card-background': '#FFFFFF', // Clean, pure white for ALL content cards

				// Text colors with better contrast
				'text-heading': '#2D2D2D', // Strong, dark gray for primary headings
				'text-body': '#5A5A5A',    // Darker gray for body text (better contrast)
				'text-subtle': '#8B8B8B',  // Muted gray for less important info

				// Accent colors - Rich browns
				'accent-primary': '#6B4F3B', // Rich, dark brown for primary accents
				'accent-secondary': '#8B6F56', // Medium brown for secondary elements
				
				// Legacy color mappings for compatibility
				'primary': '#6B4F3B',
				'primary-foreground': '#FFFFFF',
				'secondary': '#8B6F56',
				'secondary-foreground': '#FFFFFF',
				'muted': '#F5F5F5',
				'muted-foreground': '#8B8B8B',
				'accent': '#8B6F56',
				'accent-foreground': '#FFFFFF',
				'card': '#FFFFFF',
				'card-foreground': '#2D2D2D',
				'popover': '#FFFFFF',
				'popover-foreground': '#2D2D2D',
				'destructive': '#C53030',
				'destructive-foreground': '#FFFFFF',
				
				// Navigation colors
				'nav-icon': '#8B8B8B',
				'nav-icon-active': '#6B4F3B',
				
				// Border and input colors
				'border': '#E2E8F0',
				'input': '#E2E8F0',
				'ring': '#6B4F3B',
				
				// Status colors
				'success': '#2F855A',
				'warning': '#D69E2E',
				'danger': '#C53030',

				// Layered & Professional - Dark Mode
				'dark-background': '#1A202C', // Very dark blue-gray
				'dark-foreground': '#F7FAFC', // Default dark mode text
				'dark-sidebar': '#2D3748', // Slightly lighter blue-gray
				'dark-card-background': '#2D3748',
				'dark-text-heading': '#F7FAFC', // Clean off-white
				'dark-text-body': '#CBD5E0', // Light gray (better contrast)
				'dark-text-subtle': '#A0AEC0',
				'dark-accent-primary': '#D4B79F', // Warm parchment for primary accent
				'dark-accent-secondary': '#C5A687', // Lighter warm tone
				'dark-nav-icon': '#A0AEC0',
				'dark-nav-icon-active': '#D4B79F',
				
				// Dark mode border and input colors
				'dark-border': '#4A5568',
				'dark-input': '#4A5568',
				'dark-ring': '#D4B79F',
				
				// Dark mode legacy mappings
				'dark-primary': '#D4B79F',
				'dark-primary-foreground': '#1A202C',
				'dark-secondary': '#C5A687',
				'dark-secondary-foreground': '#1A202C',
				'dark-muted': '#2D3748',
				'dark-muted-foreground': '#A0AEC0',
				'dark-accent': '#C5A687',
				'dark-accent-foreground': '#1A202C',
				'dark-card': '#2D3748',
				'dark-card-foreground': '#F7FAFC',
				'dark-popover': '#2D3748',
				'dark-popover-foreground': '#F7FAFC',
				'dark-destructive': '#E53E3E',
				'dark-destructive-foreground': '#F7FAFC',
			},
			backgroundImage: {
				'gradient-heritage': 'var(--gradient-heritage)',
				'gradient-earth': 'var(--gradient-earth)',
				'gradient-warm': 'var(--gradient-warm)',
			},
			boxShadow: {
				'heritage': 'var(--shadow-heritage)',
				'earth': 'var(--shadow-earth)',
				'warm': 'var(--shadow-warm)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			spacing: {
				'heritage': '1.5rem',
				'legacy': '2.5rem',
				'vault': '4rem'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-in': {
					'0%': {
						transform: 'translateX(-100%)'
					},
					'100%': {
						transform: 'translateX(0)'
					}
				},
				'heritage-glow': {
					'0%, 100%': {
						boxShadow: '0 0 20px hsl(var(--primary) / 0.2)'
					},
					'50%': {
						boxShadow: '0 0 30px hsl(var(--primary) / 0.4)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-in': 'slide-in 0.3s ease-out',
				'heritage-glow': 'heritage-glow 2s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
