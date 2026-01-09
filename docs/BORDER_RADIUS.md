# Border Radius System

This app uses a **4-tier border radius system** for visual consistency. All border radius values should use one of these 4 defined values.

## The 4 Border Radius Values

| Name | Value | Utility Class | Usage |
|------|-------|---------------|-------|
| **Small** | 4px | `rounded-sm` | Compact elements: checkboxes, small badges, inline tags |
| **Medium** | 8px | `rounded-md` | **DEFAULT** - Most UI elements: buttons, inputs, cards, dropdowns, modals |
| **Large** | 12px | `rounded-lg` | Large containers only when specifically needed: large modal dialogs, feature cards |
| **Round** | 9999px | `rounded-full` | Circular elements: avatars, round icon buttons, pills, status indicators |

## Usage Guidelines

### Medium (8px) is the Default

When in doubt, use `rounded-md`. This is the standard border radius for:
- Buttons
- Input fields
- Cards
- Dropdown menus
- Tooltips
- Modal dialogs
- Table containers

### Small (4px) is for Compact Elements

Use `rounded-sm` for small, inline elements:
- Checkboxes
- Small badges
- Inline code tags
- Small chips

### Large (12px) is Reserved

Only use `rounded-lg` when specifically called for:
- Hero sections
- Large feature cards
- Container-level components that need visual distinction

### Round (9999px) is for Circles

Use `rounded-full` for:
- Avatars (user photos)
- Circular icon buttons
- Pill-shaped badges/tags
- Status indicator dots
- Profile pictures

## CSS Variables

The design tokens are defined in `src/index.css`:

```css
--radius-sm: 4px;     /* Small */
--radius-md: 8px;     /* Medium - DEFAULT */
--radius-lg: 12px;    /* Large */
--radius-full: 9999px; /* Round */

/* Alias for shadcn/ui compatibility */
--radius: 8px;
```

## Utility Class Mapping

All `rounded-*` utilities are mapped to these 4 values:

| Utility Class | Maps To |
|---------------|---------|
| `rounded-none` | 0px |
| `rounded-xs` | 4px (Small) |
| `rounded-sm` | 4px (Small) |
| `rounded-md` | 8px (Medium) |
| `rounded-lg` | 12px (Large) |
| `rounded-xl` | 12px (Large) |
| `rounded-2xl` | 12px (Large) |
| `rounded-3xl` | 12px (Large) |
| `rounded-full` | 9999px (Round) |

**Note:** `rounded-xl`, `rounded-2xl`, `rounded-3xl`, etc. all map to the Large value (12px) to prevent accidental usage of non-standard radii.

## Examples

### Buttons (Medium - 8px)
```tsx
<button className="rounded-md px-4 py-2">Click me</button>
```

### Checkbox (Small - 4px)
```tsx
<input type="checkbox" className="rounded-sm" />
```

### Avatar (Round)
```tsx
<img className="rounded-full w-10 h-10" src="avatar.jpg" />
```

### Large Card (Large - 12px)
```tsx
<div className="rounded-lg p-6 bg-white shadow">
  Large feature card
</div>
```

## Do's and Don'ts

### ✅ Do
- Use `rounded-md` as your default choice
- Use `rounded-full` for all circular elements
- Use `rounded-sm` for compact inline elements

### ❌ Don't
- Don't use arbitrary values like `rounded-[10px]` or `rounded-[6px]`
- Don't use `rounded-xl`, `rounded-2xl` - use `rounded-lg` instead
- Don't mix different radii on similar components
