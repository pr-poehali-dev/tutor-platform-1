import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
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
				'golos': ['Golos Text', 'sans-serif'],
				'montserrat': ['Montserrat', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				neon: {
					purple: '#a855f7',
					cyan: '#00d4ff',
					pink: '#f72585',
					yellow: '#ffd60a',
					green: '#06d6a0',
					orange: '#ff6b35',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					from: { opacity: '0', transform: 'translateY(10px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					from: { opacity: '0', transform: 'scale(0.95)' },
					to: { opacity: '1', transform: 'scale(1)' }
				},
				'spin-slow': {
					from: { transform: 'rotate(0deg)' },
					to: { transform: 'rotate(360deg)' }
				},
				'shake': {
					'0%, 100%': { transform: 'translateX(0)' },
					'20%, 60%': { transform: 'translateX(-6px)' },
					'40%, 80%': { transform: 'translateX(6px)' }
				},
				'ksusha-idle': {
					'0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
					'50%': { transform: 'translateY(-5px) rotate(-1.5deg)' }
				},
				'ksusha-think': {
					'0%, 100%': { transform: 'rotate(-7deg) translateY(0)' },
					'50%': { transform: 'rotate(-7deg) translateY(-4px)' }
				},
				'ksusha-happy': {
					'0%, 100%': { transform: 'translateY(0) rotate(0deg) scale(1)' },
					'25%': { transform: 'translateY(-12px) rotate(-5deg) scale(1.05)' },
					'50%': { transform: 'translateY(0) rotate(0deg) scale(1)' },
					'75%': { transform: 'translateY(-12px) rotate(5deg) scale(1.05)' }
				},
				'ksusha-idea': {
					'0%': { transform: 'scale(1) rotate(0deg)' },
					'30%': { transform: 'scale(1.18) rotate(-6deg)' },
					'60%': { transform: 'scale(1.18) rotate(6deg)' },
					'100%': { transform: 'scale(1) rotate(0deg)' }
				},
				'ksusha-sad': {
					'0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
					'50%': { transform: 'translateY(3px) rotate(2deg)' }
				},
				'ksusha-talk': {
					'0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
					'25%': { transform: 'translateY(-2px) rotate(0.8deg)' },
					'50%': { transform: 'translateY(0) rotate(0deg)' },
					'75%': { transform: 'translateY(-1.5px) rotate(-0.8deg)' }
				},
				'tutor-breathe': {
					'0%, 100%': { transform: 'scale(1) translateY(0)' },
					'50%': { transform: 'scale(1.035) translateY(-1px)' }
				},
				'tutor-glow': {
					'0%, 100%': { opacity: '0.45' },
					'50%': { opacity: '0.85' }
				},
				'tutor-pulse': {
					'0%, 100%': { transform: 'scale(1)', opacity: '1' },
					'50%': { transform: 'scale(1.25)', opacity: '0.7' }
				},
				'sound-bar': {
					'0%, 100%': { transform: 'scaleY(0.4)' },
					'50%': { transform: 'scaleY(1)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease forwards',
				'scale-in': 'scale-in 0.3s ease forwards',
				'spin-slow': 'spin-slow 20s linear infinite',
				'shake': 'shake 0.4s ease-in-out',
				'ksusha-idle': 'ksusha-idle 3.5s ease-in-out infinite',
				'ksusha-think': 'ksusha-think 1.2s ease-in-out infinite',
				'ksusha-happy': 'ksusha-happy 0.7s ease-in-out 2',
				'ksusha-idea': 'ksusha-idea 0.6s ease-in-out',
				'ksusha-sad': 'ksusha-sad 1.5s ease-in-out infinite',
				'ksusha-talk': 'ksusha-talk 1.6s ease-in-out infinite',
				'tutor-breathe': 'tutor-breathe 4s ease-in-out infinite',
				'tutor-glow': 'tutor-glow 3.2s ease-in-out infinite',
				'tutor-pulse': 'tutor-pulse 2s ease-in-out infinite',
				'sound-bar': 'sound-bar 0.6s ease-in-out infinite',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;