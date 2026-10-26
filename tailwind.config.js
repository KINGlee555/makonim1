/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		fontFamily: {
  			rubik: ['var(--font-rubik)'],
  			system: ['var(--font-system)']
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			ui: {
  				canvas: 'hsl(var(--ui-canvas))',
  				ink: 'hsl(var(--ui-ink))',
  				muted: 'hsl(var(--ui-muted))',
  				line: 'hsl(var(--ui-line))',
  				'line-soft': 'hsl(var(--ui-line-soft))',
  				surface: 'hsl(var(--ui-surface))',
  				accent: 'hsl(var(--ui-accent))'
  			},
  			big: {
  				canvas: 'hsl(var(--big-canvas))',
  				ink: 'hsl(var(--big-ink))',
  				muted: 'hsl(var(--big-muted))',
  				line: 'hsl(var(--big-line))',
  				'line-soft': 'hsl(var(--big-line-soft))',
  				surface: 'hsl(var(--big-surface))',
  				accent: 'hsl(var(--big-accent))',
  				turquoise: 'hsl(var(--big-turquoise))',
  				pink: 'hsl(var(--big-pink))',
  				blue: 'hsl(var(--big-blue))',
  				yellow: 'hsl(var(--big-yellow))',
  				attn: 'hsl(var(--big-attn))',
  				'attn-soft': 'hsl(var(--big-attn-soft))',
  				'attn-ink': 'hsl(var(--big-attn-ink))'
  			},
  			pst: {
  				ink: 'hsl(var(--pst-ink))',
  				yellow: 'hsl(var(--pst-yellow))',
  				pink: 'hsl(var(--pst-pink))'
  			},
  			market: {
  				ink: 'hsl(var(--market-ink))',
  				pink: 'hsl(var(--market-pink))',
  				'pink-soft': 'hsl(var(--market-pink-soft))',
  				'pink-tint': 'hsl(var(--market-pink-tint))',
  				yellow: 'hsl(var(--market-yellow))',
  				'yellow-deep': 'hsl(var(--market-yellow-deep))',
  				'yellow-soft': 'hsl(var(--market-yellow-soft))',
  				blue: 'hsl(var(--market-blue))',
  				'blue-soft': 'hsl(var(--market-blue-soft))',
  				surface: 'hsl(var(--market-surface))',
  				track: 'hsl(var(--market-track))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
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
  			}
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
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}