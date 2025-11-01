/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
			fontFamily: {
			prompt: ['"Prompt"', 'sans-serif']
			},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
				// New Color Scheme
				primary: '#F26623', // Orange
				secondary: '#000000', // Black
  			background: '#FFFFFF', // White
				accent: {
					DEFAULT: '#F5F5F5', // Light Gray
					orange: '#FFF2EC', // Soft Orange Tint
				},
				// Keep existing HSL-based colors for compatibility
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
		keyframes: {
			shake: {
				'0%, 100%': { transform: 'translateX(0)' },
				'10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
				'20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
			}
		},
		animation: {
			shake: 'shake 0.5s ease-in-out',
		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}