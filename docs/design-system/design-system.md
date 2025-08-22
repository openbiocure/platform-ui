# 🎨 OpenBioCure Platform Design System

This document defines the visual identity, typography, color palette, and component guidelines for the OpenBioCure Platform.

## 🏷️ Brand Identity

### Logo
- **File**: `public/assets/icon.svg`
- **Usage**: Primary platform identifier
- **Placement**: Navigation header, login pages, documentation
- **Sizing**: Minimum 32px height for digital use

## 🔤 Typography

### Primary Font Family
- **Font**: Montserrat
- **Style**: Sans-serif, geometric
- **Characteristics**: Modern, professional, highly readable
- **Use Cases**: Headings, body text, UI elements

### Font Weights
- **Light**: 300 - Subtle text, captions
- **Regular**: 400 - Body text, default
- **Medium**: 500 - Subheadings, emphasis
- **SemiBold**: 600 - Section headers
- **Bold**: 700 - Main headings, strong emphasis

### Typography Scale
```css
/* Headings */
h1: 2.5rem (40px) - Montserrat Bold
h2: 2rem (32px) - Montserrat SemiBold
h3: 1.5rem (24px) - Montserrat Medium
h4: 1.25rem (20px) - Montserrat Medium
h5: 1.125rem (18px) - Montserrat Regular
h6: 1rem (16px) - Montserrat Regular

/* Body Text */
body: 1rem (16px) - Montserrat Regular
small: 0.875rem (14px) - Montserrat Light
caption: 0.75rem (12px) - Montserrat Light
```

## 🎨 Color Palette

### Primary Colors
- **Primary Blue**: `#00239C`
  - **CMYK**: 100, 95, 30, 1
  - **RGB**: 0, 35, 156
  - **Usage**: Primary buttons, links, main navigation
  - **Accessibility**: AAA contrast on white backgrounds

- **Secondary Blue**: `#001E62`
  - **CMYK**: 100, 71, 0, 5
  - **RGB**: 0, 30, 98
  - **Usage**: Secondary elements, borders, hover states
  - **Accessibility**: AAA contrast on white backgrounds

### Accent Colors
- **Accent Orange**: `#E76900`
  - **CMYK**: 0, 54, 100, 9
  - **RGB**: 231, 105, 0
  - **Usage**: Call-to-action buttons, alerts, highlights
  - **Accessibility**: AA contrast on white backgrounds

- **Accent Cyan**: `#00A3E0`
  - **CMYK**: 74, 19, 0, 0
  - **RGB**: 0, 163, 224
  - **Usage**: Links, info elements, secondary actions
  - **Accessibility**: AA contrast on white backgrounds

### Neutral Colors
- **White**: `#FFFFFF`
- **Light Gray**: `#F8F9FA`
- **Medium Gray**: `#6C757D`
- **Dark Gray**: `#343A40`
- **Black**: `#000000`

## 🎯 Color Usage Guidelines

### Primary Actions
- **Primary Buttons**: Primary Blue (`#00239C`)
- **Hover States**: Secondary Blue (`#001E62`)
- **Active States**: Darker shade of Primary Blue

### Secondary Actions
- **Secondary Buttons**: White with Primary Blue border
- **Links**: Accent Cyan (`#00A3E0`)
- **Hover Links**: Primary Blue (`#00239C`)

### Feedback & Status
- **Success**: Green (`#28A745`)
- **Warning**: Accent Orange (`#E76900`)
- **Error**: Red (`#DC3545`)
- **Info**: Accent Cyan (`#00A3E0`)

### Backgrounds
- **Primary Background**: White (`#FFFFFF`)
- **Secondary Background**: Light Gray (`#F8F9FA`)
- **Card Backgrounds**: White with subtle shadows
- **Modal Overlays**: Semi-transparent dark overlay

## 🧩 Component Guidelines

### Buttons
- **Primary Button**: Primary Blue background, white text
- **Secondary Button**: White background, Primary Blue border and text
- **Danger Button**: Red background, white text
- **Ghost Button**: Transparent background, Primary Blue text

### Cards
- **Background**: White
- **Border**: Light Gray (`#F8F9FA`)
- **Shadow**: Subtle drop shadow for depth
- **Padding**: 1.5rem (24px) standard

### Forms
- **Input Borders**: Light Gray (`#F8F9FA`)
- **Focus States**: Primary Blue (`#00239C`)
- **Error States**: Red (`#DC3545`)
- **Success States**: Green (`#28A745`)

### Navigation
- **Active State**: Primary Blue (`#00239C`)
- **Hover State**: Secondary Blue (`#001E62`)
- **Background**: White with subtle border

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1439px
- **Large Desktop**: 1440px+

### Spacing Scale
```css
/* Spacing Units */
xs: 0.25rem (4px)
sm: 0.5rem (8px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
2xl: 3rem (48px)
3xl: 4rem (64px)
```

## 🌙 Dark Mode Support

### Dark Mode Colors
- **Background**: Dark Gray (`#343A40`)
- **Surface**: Medium Gray (`#6C757D`)
- **Text**: Light Gray (`#F8F9FA`)
- **Borders**: Medium Gray (`#6C757D`)

### Color Inversion
- Primary Blue becomes lighter in dark mode
- Accent colors maintain their vibrancy
- Neutral colors invert appropriately

## 🎨 Brand Customization

### SaaS Tenant Customization
- **Logo**: Tenant-specific logos
- **Primary Color**: Tenant brand colors
- **Typography**: Tenant font preferences
- **Accent Colors**: Tenant accent palette

### White-Label Options
- **Platform Branding**: Removable for enterprise clients
- **Custom CSS**: Tenant-specific styling
- **Theme Switching**: Dynamic theme application

## 📋 Implementation

### CSS Variables
```css
:root {
  /* Primary Colors */
  --color-primary: #00239C;
  --color-primary-dark: #001E62;
  
  /* Accent Colors */
  --color-accent-orange: #E76900;
  --color-accent-cyan: #00A3E0;
  
  /* Typography */
  --font-family: 'Montserrat', sans-serif;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
}
```

### Tailwind CSS Integration
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00239C',
          dark: '#001E62',
        },
        accent: {
          orange: '#E76900',
          cyan: '#00A3E0',
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      }
    }
  }
}
```

## 🔍 Accessibility

### Color Contrast
- **Primary Text**: Minimum 4.5:1 contrast ratio
- **Large Text**: Minimum 3:1 contrast ratio
- **UI Elements**: Minimum 3:1 contrast ratio

### Focus Indicators
- **Focus Rings**: Accent Cyan (`#00A3E0`)
- **Focus States**: Visible and keyboard accessible
- **High Contrast**: Enhanced focus indicators

## 📚 Resources

- [Montserrat Font](https://fonts.google.com/specimen/Montserrat)
- [shadcn/ui Components](https://ui.shadcn.com/docs/components-json)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

*Last Updated: August 2025*  
*Version: 1.0*  
*Status: Active*
