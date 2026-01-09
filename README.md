# Mercury Design Prototype

A vibecoded replica of prod for prototyping.

A lightweight React prototype repository that mirrors your product's design system, allowing designers to clone, run locally, and iterate on UI without backend complexity.

## 🚀 Quick Start

### Prerequisites

- **Node.js 20.19+ or 22.12+** (check version: `node -v`)
- Git

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd mercury-prototype

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173)

## 📁 Project Structure

```
mercury-prototype/
├── src/
│   ├── components/
│   │   ├── core/              # Custom Mercury components
│   │   │   ├── AccountCard.tsx
│   │   │   ├── TransactionRow.tsx
│   │   │   └── Header.tsx
│   │   ├── ui/                # shadcn/ui primitives (auto-generated)
│   │   └── component-registry.json  # Component usage tracking
│   ├── pages/
│   │   ├── Dashboard.tsx      # Main dashboard view
│   │   └── ComponentGallery.tsx  # Component preview gallery
│   ├── data/                  # Mock JSON data
│   │   ├── accounts.json
│   │   ├── transactions.json
│   │   └── users.json
│   ├── hooks/                 # Custom React hooks
│   ├── styles/
│   │   └── index.css          # Design tokens (colors, fonts)
│   └── types/                 # TypeScript types
├── docs/
│   └── DESIGNER_GUIDE.md      # Complete designer onboarding guide
├── scripts/
│   └── track-usage.js         # Automated component usage tracker
└── package.json
```

## 🎨 Design System Galleries

### Component Gallery (`/components`)

- **All core components** with live previews
- **Multiple variants** for each component (states, types, edge cases)
- **Usage tracking** - see where each component is used
- **Search functionality** to quickly find components
- **Component statistics** and metadata

### Typography Gallery (`/typography`)

- **Complete text style system** from Figma using Arcadia font family
- **Live previews** of all typography variants
- **Specifications** for each text style (size, weight, line height)
- **Real-world examples** showing typography in context
- **Code snippets** for easy implementation

### Routes

- `/dashboard` - Main product dashboard with sample data
- `/components` - Component gallery with all variants
- `/typography` - Typography system gallery with all text styles

## 🛠️ For Designers

See the complete [Designer Guide](docs/DESIGNER_GUIDE.md) for:

- One-time setup instructions
- Daily workflow
- How to modify components and data
- Submitting changes via Pull Requests
- Troubleshooting

### What You Can Safely Edit

✅ **Safe to modify:**
- `src/components/core/*` - Custom components
- `src/data/*.json` - Mock data
- `src/index.css` - Design tokens (colors, fonts, spacing)
- `src/typography.css` - Typography styles
- `src/pages/*` - Page layouts

❌ **Avoid editing:**
- `src/components/ui/*` - Auto-generated shadcn/ui components
- `node_modules/` - External dependencies
- Config files

## 🧩 Component Architecture

### Core Components (`src/components/core/`)

Your team's custom components built on top of UI primitives:

- **Header** - Navigation with user menu
- **AccountCard** - Display account balance, type, APY
- **TransactionRow** - Transaction list item with merchant, amount, category

### UI Components (`src/components/ui/`)

shadcn/ui primitive components (Button, Card, Badge, etc.). These are auto-generated and shouldn't be manually edited.

## 📊 Mock Data System

All data lives in `src/data/*.json` files:

```typescript
// Example: Add a new account in src/data/accounts.json
{
  "id": "acc_new",
  "name": "New Account",
  "type": "checking",
  "balance": 10000.00,
  "currency": "USD",
  "accountNumber": "****1234",
  "routingNumber": "****8832",
  "status": "active"
}
```

Changes to JSON files automatically update the UI via React hooks.

## 🔧 Scripts

```bash
# Development
npm run dev          # Start dev server (localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build

# Linting
npm run lint         # Run ESLint

# Component Tracking
npm run track-usage  # Update component usage data (requires ripgrep)

# Visual Testing
npm run test:visual         # Run visual regression tests
npm run test:visual:update  # Update baseline screenshots
npm run test:visual:ui      # Open interactive test UI
npm run test:visual:report  # View test report
```

## 🧪 Visual Testing

This project uses **Playwright** for visual regression testing to catch unintended styling changes.

### How It Works

1. **Baseline screenshots** are stored for each component
2. When you run tests, Playwright compares current screenshots against baselines
3. If pixels differ beyond the threshold, the test fails and shows a visual diff
4. You can review the diff and either fix the issue or update the baseline

### Quick Start

```bash
# First time: Create baseline screenshots
npm run test:visual:update

# After making changes: Run tests to compare
npm run test:visual

# If test fails and the change is intentional:
npm run test:visual:update
```

### Test Route

Components are rendered in isolation at `/test-components/:componentId/:variant`:

- `/test-components/ds-button/all` - All button variants
- `/test-components/ds-checkbox/all` - All checkbox states
- `/test-components/ds-table/all` - All table variants

Visit `/test-components` to see all available test components.

### Interactive UI

For the best experience reviewing visual diffs:

```bash
npm run test:visual:ui
```

This opens an interactive UI where you can:
- See all test results at a glance
- Compare baseline vs current screenshots
- View pixel-level diffs highlighted
- Re-run individual tests

### What Gets Tested

| Component | Variants |
|-----------|----------|
| DSButton | Small, Large, All |
| DSTextInput | Default states |
| DSCombobox | All variants |
| DSCheckbox | All states |
| DSRadioGroup | All variants |
| DSTable | Default, Interactive |
| GroupedTable | Default |
| Badge | All types |
| FilterMenu | Default |
| And more... | |

### Screenshot Storage

Baseline screenshots are stored in:
```
src/tests/visual/*.visual.spec.ts-snapshots/
```

These should be committed to git so the whole team uses the same baselines.

## 📦 Tech Stack

- **Vite** - Lightning-fast dev server
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Custom CSS Design System** - Utility classes and CSS custom properties
- **shadcn/ui** - Component primitives
- **React Router** - Client-side routing

## 🚢 Deployment

This project is optimized for **Vercel** deployment:

1. Connect your GitHub repo to Vercel
2. Configure build settings (auto-detected)
3. Every push creates a preview deployment
4. Every PR gets a unique preview URL

## 🔄 Keeping Components in Sync

The `component-registry.json` tracks where each component is used. To update:

```bash
npm run track-usage
```

This script uses `ripgrep` to scan the codebase and update usage information.

## 📝 Adding New Components

1. Create component in `src/components/core/`
2. Add variants to `ComponentGallery.tsx`
3. Update `component-registry.json` with metadata
4. Run `npm run track-usage` to update usage data
5. Document in Designer Guide if needed

## 🐛 Troubleshooting

### Node.js Version Error

If you see `Vite requires Node.js version 20.19+ or 22.12+`:

**Mac:**
```bash
# Using nvm (recommended)
nvm install 22
nvm use 22

# Or using Homebrew
brew upgrade node
```

**Windows:**
Download the latest LTS from [nodejs.org](https://nodejs.org)

### Dev Server Won't Start

```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Changes Not Appearing

1. Check terminal for errors
2. Save the file (`Cmd+S` / `Ctrl+S`)
3. Hard refresh browser (`Cmd+Shift+R` / `Ctrl+Shift+R`)
4. Restart dev server

## 🤝 Contributing

1. Create a new branch: `git checkout -b yourname/feature-description`
2. Make changes and test locally
3. Commit: `git commit -m "Description of changes"`
4. Push: `git push origin yourname/feature-description`
5. Open a Pull Request
6. Share the Vercel preview URL for feedback

## 📚 Resources

- [Designer Guide](docs/DESIGNER_GUIDE.md) - Complete guide for non-technical users
- [Typography System](docs/TYPOGRAPHY.md) - Complete typography documentation
- [Utilities Reference](docs/UTILITIES.md) - Complete styling utilities reference
- [Font Setup](FONT_SETUP.md) - Technical details of Arcadia font integration
- [shadcn/ui docs](https://ui.shadcn.com/) - Component library documentation
- [Vite](https://vitejs.dev/) - Build tool documentation

## 📄 License

MIT

---

**Need Help?**
- Check the [Designer Guide](docs/DESIGNER_GUIDE.md)
- Post in #design-eng-help on Slack
- Create a GitHub Issue
