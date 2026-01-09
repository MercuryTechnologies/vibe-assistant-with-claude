# Design System Utilities Reference

This document is the single source of truth for styling conventions in this codebase. **Only design system utilities** are allowed—use utility classes, CSS custom properties, and component CSS.

---

## Table of Contents

1. [Styling Philosophy](#styling-philosophy)
2. [Available Utility Classes](#available-utility-classes)
3. [Responsive Styling Policy](#responsive-styling-policy)
4. [State Styling Policy](#state-styling-policy)
5. [Border Radius Rules](#border-radius-rules)
6. [Component Checklist](#component-checklist)
7. [Forbidden Patterns Reference](#forbidden-patterns-reference)

---

## Styling Philosophy

### What to Use

| Approach | When to Use | Example |
|----------|-------------|---------|
| **Utility classes** | Layout, spacing, positioning | `className="flex items-center gap-4"` |
| **CSS custom properties** | Colors, semantic tokens | `style={{ color: 'var(--ds-text-default)' }}` |
| **Component CSS** | Component-specific styles, states, responsive | `.ds-button:hover { ... }` |
| **Design system classes** | Typography, semantic colors | `className="text-body text-muted-foreground"` |

### What NOT to Use (Forbidden Patterns)

- **State prefixes in className**: `hover:`, `focus:`, `sm:`, `md:`, `lg:`, `data-[state=...]`
- **Arbitrary bracket values**: `bg-[#color]`, `text-[15px]`, `rounded-[20px]`, `w-[256px]`
- **Color tokens with numbers**: `text-gray-500`, `bg-slate-100`, etc.

---

## Available Utility Classes

All utilities are defined in `src/utilities.css` and use design system tokens.

### Display

```css
.flex, .inline-flex, .grid, .inline-grid
.block, .inline-block, .inline, .hidden
```

### Flex Direction & Wrap

```css
.flex-row, .flex-row-reverse, .flex-col, .flex-col-reverse
.flex-wrap, .flex-nowrap, .flex-wrap-reverse
```

### Flex Grow/Shrink

```css
.flex-1, .flex-auto, .flex-initial, .flex-none
.grow, .grow-0, .shrink, .shrink-0
```

### Alignment

```css
/* Align Items */
.items-start, .items-end, .items-center, .items-baseline, .items-stretch

/* Justify Content */
.justify-start, .justify-end, .justify-center
.justify-between, .justify-around, .justify-evenly
```

### Gap (Token-Backed)

| Class | Value | Token |
|-------|-------|-------|
| `.gap-1` | 4px | `--spacing-xs` |
| `.gap-2` | 8px | `--spacing-sm` |
| `.gap-3` | 12px | `--spacing-3` |
| `.gap-4` | 16px | `--spacing-md` |
| `.gap-6` | 24px | `--spacing-lg` |
| `.gap-8` | 32px | `--spacing-xl` |

Also available: `.gap-x-*`, `.gap-y-*` for row/column gaps.

### Padding (Token-Backed)

| Class | Value | Token |
|-------|-------|-------|
| `.p-1` | 4px | `--spacing-xs` |
| `.p-2` | 8px | `--spacing-sm` |
| `.p-3` | 12px | `--spacing-3` |
| `.p-4` | 16px | `--spacing-md` |
| `.p-6` | 24px | `--spacing-lg` |
| `.p-8` | 32px | `--spacing-xl` |

Also available: `.px-*`, `.py-*`, `.pt-*`, `.pr-*`, `.pb-*`, `.pl-*`

### Margin (Token-Backed)

Same scale as padding: `.m-*`, `.mx-*`, `.my-*`, `.mt-*`, `.mr-*`, `.mb-*`, `.ml-*`

### Width & Height

```css
.w-full, .w-auto, .w-screen, .w-min, .w-max, .w-fit
.h-full, .h-auto, .h-screen, .h-min, .h-max, .h-fit
.min-w-0, .min-w-full, .max-w-none, .max-w-full
.min-h-0, .min-h-full, .min-h-screen
```

Fixed sizes: `.w-1` through `.w-64`, `.h-1` through `.h-48`

### Positioning

```css
.static, .fixed, .absolute, .relative, .sticky
.inset-0, .inset-x-0, .inset-y-0
.top-0, .right-0, .bottom-0, .left-0
.z-0, .z-10, .z-20, .z-30, .z-40, .z-50
```

### Overflow

```css
.overflow-auto, .overflow-hidden, .overflow-visible, .overflow-scroll
.overflow-x-auto, .overflow-x-hidden
.overflow-y-auto, .overflow-y-hidden
```

### Border Radius

See [Border Radius Rules](#border-radius-rules) section.

### Border

```css
.border, .border-0, .border-2, .border-4
.border-t, .border-r, .border-b, .border-l
.border-border, .border-transparent
```

### Shadow

```css
.shadow-none, .shadow-sm, .shadow, .shadow-md, .shadow-lg
```

### Text

```css
/* Alignment */
.text-left, .text-center, .text-right, .text-justify

/* Decoration */
.underline, .line-through, .no-underline

/* Transform */
.uppercase, .lowercase, .capitalize, .normal-case

/* Overflow */
.truncate, .whitespace-nowrap, .break-words, .break-all

/* Weight */
.font-normal, .font-medium, .font-semibold, .font-bold
```

### Cursor & Interaction

```css
.cursor-pointer, .cursor-default, .cursor-not-allowed
.pointer-events-none, .pointer-events-auto
.select-none, .select-text, .select-all
```

### Transitions & Animations

```css
/* Transitions */
.transition, .transition-all, .transition-colors
.transition-opacity, .transition-transform
.duration-75, .duration-100, .duration-150, .duration-200, .duration-300

/* Animations */
.animate-fade-in, .animate-fade-out
.animate-scale-in, .animate-scale-out
.animate-slide-in-from-top, .animate-slide-in-from-bottom
.animate-pulse, .animate-spin
```

---

## Responsive Styling Policy

### Rule: No Responsive Utility Prefixes

**DO NOT USE** responsive prefixes like `sm:`, `md:`, `lg:`, `xl:` in className strings.

### How to Handle Responsiveness

Use CSS media queries in component CSS or `src/components.css`:

```css
/* In components.css or component-specific CSS */
.my-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: var(--spacing-md);
}

@media (min-width: 768px) {
  .my-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .my-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
```

### Example

**Forbidden:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
```

**Correct (Design System):**
```tsx
<div className="responsive-grid-4">
```

With CSS:
```css
.responsive-grid-4 {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: var(--spacing-md);
}

@media (min-width: 768px) {
  .responsive-grid-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .responsive-grid-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
```

### Breakpoint Reference

| Name | Min Width | Use Case |
|------|-----------|----------|
| `sm` | 640px | Small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

---

## State Styling Policy

### Rule: No State Prefixes in Class Strings

**DO NOT USE** state prefixes like `hover:`, `focus:`, `focus-visible:`, `active:`, `disabled:`, `data-[state=...]` in className strings.

### How to Handle States

Use CSS pseudo-selectors and attribute selectors in component CSS:

```css
/* In components.css or component-specific CSS */

/* Hover states */
.ds-button:hover {
  background-color: var(--purple-magic-700);
}

/* Focus states */
.ds-input:focus-visible {
  outline: 2px solid var(--purple-magic-600);
  outline-offset: 2px;
}

/* Disabled states */
.ds-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Data attribute states (Radix UI) */
.ds-dropdown-item[data-highlighted] {
  background-color: rgba(112, 115, 147, 0.06);
}

.ds-checkbox[data-state="checked"] {
  background-color: var(--purple-magic-600);
}

/* ARIA states */
.ds-tab[aria-selected="true"] {
  border-bottom-color: var(--purple-magic-600);
}
```

### Example

**Forbidden:**
```tsx
<button className="bg-primary hover:bg-primary-hover focus-visible:ring-2 disabled:opacity-50">
```

**Correct (Design System):**
```tsx
<button className="ds-button-primary">
```

With CSS:
```css
.ds-button-primary {
  background-color: var(--purple-magic-600);
  color: white;
}

.ds-button-primary:hover {
  background-color: var(--purple-magic-700);
}

.ds-button-primary:focus-visible {
  outline: 2px solid var(--purple-magic-600);
  outline-offset: 2px;
}

.ds-button-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### State Selector Reference

| State | CSS Selector | Example |
|-------|--------------|---------|
| Hover | `:hover` | `.btn:hover { ... }` |
| Focus | `:focus` | `.input:focus { ... }` |
| Focus Visible | `:focus-visible` | `.btn:focus-visible { ... }` |
| Active | `:active` | `.btn:active { ... }` |
| Disabled | `:disabled` | `.btn:disabled { ... }` |
| Checked | `:checked` or `[data-state="checked"]` | `.checkbox:checked { ... }` |
| Open | `[data-state="open"]` | `.dropdown[data-state="open"] { ... }` |
| Selected | `[data-state="selected"]` or `[aria-selected="true"]` | `.tab[aria-selected="true"] { ... }` |
| Highlighted | `[data-highlighted]` | `.item[data-highlighted] { ... }` |

---

## Border Radius Rules

### The 4-Tier System

This design system uses **only 4 border radius values**:

| Name | Value | Class | Token | When to Use |
|------|-------|-------|-------|-------------|
| Small | 4px | `.rounded-sm` | `--radius-sm` | Compact elements (checkboxes, small badges) |
| **Medium** | **8px** | **`.rounded-md`** | **`--radius-md`** | **DEFAULT for most elements** |
| Large | 12px | `.rounded-lg` | `--radius-lg` | Large containers (when specifically needed) |
| Round | 9999px | `.rounded-full` | `--radius-full` | Circular elements (avatars, pills) |

### Default: Use `rounded-md`

Always use `rounded-md` (8px) unless specifically instructed otherwise:

```tsx
// Correct - using default rounded-md
<button className="rounded-md px-4 py-2">Click me</button>
<div className="rounded-md border p-4">Card content</div>
<input className="rounded-md border px-3 py-2" />
```

### Never Use Arbitrary Radius Values

**DO NOT USE** patterns like `rounded-[20px]`, `rounded-[10px]`, etc.

---

## Component Checklist

When creating or updating a component, verify:

### Required Checks

- [ ] **No forbidden patterns** in `className` strings
- [ ] **No arbitrary bracket values** (`[...]`) in class strings
- [ ] **No responsive prefixes** (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`)
- [ ] **No state prefixes** (`hover:`, `focus:`, `active:`, `disabled:`, `data-[...]`)
- [ ] **Border radius** uses only the 4-tier system (default: `rounded-md`)
- [ ] **Colors** use CSS custom properties (`var(--*)`) or semantic classes
- [ ] **Typography** uses design system classes (`.text-body`, `.text-title-*`)
- [ ] **Spacing** uses token-backed utilities (`.gap-4`, `.p-4`, etc.)

### State/Interactive Styling

- [ ] Hover states handled in CSS with `:hover`
- [ ] Focus states handled in CSS with `:focus-visible`
- [ ] Disabled states handled in CSS with `:disabled`
- [ ] Data-state attributes handled in CSS with `[data-state="..."]`

### Responsive Styling

- [ ] No `sm:`, `md:`, `lg:`, `xl:` prefixes
- [ ] Responsive behavior handled via CSS media queries
- [ ] Breakpoint CSS added to `components.css` or component CSS

---

## Forbidden Patterns Reference

### Arbitrary Colors: `bg-[#color]`, `text-[#color]`

**Problem:** `bg-[#5266eb]`, `text-[#363644]`

**Solution:** Use CSS custom properties:

```tsx
// Before
<div className="bg-[#5266eb] text-[#363644]">

// After - Option 1: Inline style
<div style={{ backgroundColor: 'var(--purple-magic-600)', color: 'var(--neutral-base-700)' }}>

// After - Option 2: Component CSS class
<div className="ds-highlight-bg">
```

### Arbitrary Sizes: `w-[256px]`, `h-[49px]`

**Problem:** `w-[256px]`, `min-h-[400px]`

**Solution:** Use component CSS or inline styles:

```tsx
// Before
<div className="w-[256px] min-h-[400px]">

// After - Option 1: Inline style
<div style={{ width: 256, minHeight: 400 }}>

// After - Option 2: Component CSS class
<div className="ds-form-container">
```

### Arbitrary Typography: `text-[15px]`, `leading-[24px]`

**Problem:** `text-[15px] leading-[24px] tracking-[0.1px]`

**Solution:** Use typography design tokens/classes:

```tsx
// Before
<span className="text-[15px] leading-[24px]">

// After - Option 1: Typography class
<span className="text-body">

// After - Option 2: Inline style with tokens
<span style={{ fontSize: 15, lineHeight: '24px' }}>
```

### Arbitrary Border Radius: `rounded-[20px]`

**Problem:** `rounded-[20px]`, `rounded-[10px]`

**Solution:** Use the 4-tier system (usually `rounded-md` or `rounded-full`):

```tsx
// Before
<button className="rounded-[20px]">

// After - Usually pills want rounded-full
<button className="rounded-full">

// After - Or use default rounded-md
<button className="rounded-md">
```

### CSS Variable in Brackets: `bg-[var(--color)]`

**Problem:** `bg-[var(--purple-magic-600)]`

**Solution:** Use inline styles or create a semantic class:

```tsx
// Before
<div className="bg-[var(--purple-magic-600)]">

// After - Inline style
<div style={{ backgroundColor: 'var(--purple-magic-600)' }}>

// After - Semantic class in CSS
<div className="bg-primary">
```

### Complex Hover with Colors: `hover:bg-[rgba(...)]`

**Problem:** `hover:bg-[rgba(112,115,147,0.06)]`

**Solution:** Move to component CSS:

```css
/* In components.css */
.ds-menu-item:hover {
  background-color: rgba(112, 115, 147, 0.06);
}
```

```tsx
// Before
<div className="hover:bg-[rgba(112,115,147,0.06)]">

// After
<div className="ds-menu-item">
```

### Group Hover: `group-hover:*`

**Problem:** `group-hover:text-primary`

**Solution:** Use CSS with `.group:hover` descendant selector:

```css
/* In components.css */
.ds-card-link:hover .ds-card-link-text {
  color: var(--color-primary);
}
```

```tsx
// Before
<div className="group">
  <span className="group-hover:text-primary">Link</span>
</div>

// After
<div className="ds-card-link">
  <span className="ds-card-link-text">Link</span>
</div>
```

---

## Quick Reference Card

### Allowed

```tsx
// Utility classes (from utilities.css)
className="flex items-center gap-4 p-4 rounded-md"

// Design system typography
className="text-body text-muted-foreground"

// Semantic color classes
className="bg-background border-border"

// Inline styles with CSS variables
style={{ color: 'var(--ds-text-default)' }}
```

### NOT Allowed

```tsx
// Responsive prefixes (forbidden)
className="md:flex lg:grid-cols-4"  // ❌

// State prefixes (forbidden)
className="hover:bg-primary focus:ring-2"  // ❌

// Arbitrary bracket values (forbidden)
className="bg-[#5266eb] w-[256px] text-[15px]"  // ❌

// data-[state] in className (forbidden)
className="data-[state=open]:bg-accent"  // ❌
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `src/utilities.css` | Layout, spacing, sizing utility classes |
| `src/animations.css` | Animation keyframes and utility classes |
| `src/typography.css` | Typography classes |
| `src/components.css` | Component-specific styles, state styles, responsive styles |
| `src/index.css` | Design tokens (CSS custom properties) |
