# Arcadia Font Integration

This document summarizes the Arcadia font setup for the Mercury Vibe application.

## Overview

The Arcadia variable font family has been integrated as the **exclusive typography** for this application. No other fonts are used.

## What Was Done

### 1. Font Files Added
- Copied 4 Arcadia variable font files to `public/fonts/`:
  - `ArcadiaText-VariableVF.woff2` (58 KB)
  - `ArcadiaTextItalic-VariableVF.woff2` (60 KB)
  - `ArcadiaDisplay-VariableVF.woff2` (58 KB)
  - `ArcadiaDisplayItalic-VariableVF.woff2` (60 KB)

### 2. Font Declarations Created
- Created `src/fonts.css` with @font-face declarations for all 4 font files
- Configured variable font weights (100-900) for maximum flexibility
- Set `font-display: swap` for optimal loading performance

### 3. CSS Variables Updated
In `src/index.css`, updated font family variables:
```css
--font-sans: 'Arcadia', sans-serif;      /* Body text (default) */
--font-display: 'Arcadia Display', sans-serif;  /* Headings */
--font-mono: 'Arcadia', monospace;       /* Code/monospace */
```

### 4. Utility Classes Added
Added utility classes in `src/index.css`:
```css
.font-display { font-family: var(--font-display); }
.font-sans { font-family: var(--font-sans); }
```

### 5. Documentation Updated
- Updated `docs/DESIGNER_GUIDE.md` with Typography section
- Created `public/fonts/README.md` with font details
- This summary document created

## Usage Examples

### Body Text (Default)
```tsx
<p>This text automatically uses Arcadia</p>
```

### Display Text (Headings)
```tsx
<h1 className="font-display text-4xl font-bold">
  Large Display Heading
</h1>
```

### Font Weights
```tsx
<p className="font-light">Light (300)</p>
<p className="font-normal">Normal (400)</p>
<p className="font-semibold">Semibold (600)</p>
<p className="font-bold">Bold (700)</p>
<p className="font-black">Black (900)</p>
```

### Italic Text
```tsx
<p className="italic">Italic text uses ArcadiaTextItalic-VariableVF</p>
<h1 className="font-display italic">Display italic heading</h1>
```

## Variable Font Benefits

1. **Flexible Weights**: Use any weight from 100-900 without additional files
2. **Small File Size**: Only 4 files (~236 KB total) for complete coverage
3. **Smooth Animations**: Can animate between font weights smoothly
4. **No Font Loading Flash**: `font-display: swap` ensures text remains visible

## Testing

To verify the fonts are working:

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Open browser DevTools → Network tab
3. Filter by "Font" and verify all 4 .woff2 files load successfully
4. Inspect any text element - should show "Arcadia" or "Arcadia Display" in computed font-family

## Source Files

Original fonts from: `/Users/edwardhuang/Downloads/Webfonts/Arcadia v2 test fonts/Woff2/`

## Notes

- All UI components automatically inherit Arcadia via the body element's default font
- The `font-display` class must be explicitly added to elements that need display font
- Variable fonts are supported in all modern browsers (95%+ global support)
