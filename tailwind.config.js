/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Arcadia Text', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Arcadia Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      fontSize: {
        // Design System Font Sizes
        'hero': ['34px', { lineHeight: '44px', letterSpacing: '0' }],
        'title-main': ['28px', { lineHeight: '36px', letterSpacing: '0' }],
        'title-secondary': ['19px', { lineHeight: '28px', letterSpacing: '0' }],
        'title-minor': ['17px', { lineHeight: '28px', letterSpacing: '0' }],
        'eyebrow': ['12px', { lineHeight: '24px', letterSpacing: '1px' }],
        'body-lg': ['17px', { lineHeight: '28px', letterSpacing: '0' }],
        'body': ['15px', { lineHeight: '24px', letterSpacing: '0' }],
        'body-sm': ['14px', { lineHeight: '20px', letterSpacing: '0' }],
        'label': ['13px', { lineHeight: '20px', letterSpacing: '0.1px' }],
        'tiny': ['12px', { lineHeight: '20px', letterSpacing: '0.2px' }],
        'micro': ['10px', { lineHeight: '20px', letterSpacing: '0.2px' }],
      },
      fontWeight: {
        normal: '400',
        medium: '400',
        semibold: '480',
        demi: '480',
        bold: '480',
      },
      colors: {
        // Design System Text Colors
        'ds-title': '#1e1e2a',
        'ds-default': '#363644',
        'ds-secondary': '#535461',
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

