# Designer Guide

This guide will help you set up and use the Mercury Design Prototype. No prior coding experience required!

## Table of Contents

1. [One-Time Setup](#one-time-setup)
2. [Daily Workflow](#daily-workflow)
3. [Making Changes](#making-changes)
4. [Submitting Your Work](#submitting-your-work)
5. [What You Can Safely Edit](#what-you-can-safely-edit)
6. [Common Tasks](#common-tasks)
7. [Troubleshooting](#troubleshooting)

---

## One-Time Setup

### Step 1: Install Node.js

1. Go to [nodejs.org](https://nodejs.org)
2. Download the **LTS** version (the "Recommended" button)
3. Run the installer and follow the prompts
4. Restart your terminal/computer

### Step 2: Install Git (if you don't have it)

**Mac:**
```bash
xcode-select --install
```

**Windows:**
Download from [git-scm.com](https://git-scm.com/download/win)

### Step 3: Clone the Repository

1. Open Terminal (Mac) or Command Prompt (Windows)
2. Navigate to where you want the project:
   ```bash
   cd ~/Documents
   ```
3. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_ORG/mercury-prototype.git
   cd mercury-prototype
   ```

### Step 4: Install Dependencies

```bash
npm install
```

This only needs to be done once, or when someone adds new dependencies.

---

## Daily Workflow

### Starting Your Day

1. Open your terminal
2. Navigate to the project folder:
   ```bash
   cd ~/Documents/mercury-prototype
   ```
3. Get the latest changes:
   ```bash
   git pull
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:5173](http://localhost:5173) in your browser

### When You're Done

Press `Ctrl+C` in the terminal to stop the server.

---

## Making Changes

### Before Making Changes

Always create a new branch:

```bash
git checkout -b your-name/description-of-change
```

Example:
```bash
git checkout -b sarah/update-button-colors
```

### While Making Changes

- Save files normally (`Cmd+S` or `Ctrl+S`)
- The browser will automatically refresh
- If something breaks, you can always undo (`Cmd+Z`)

---

## Submitting Your Work

### Step 1: Save Your Changes

```bash
git add .
git commit -m "Brief description of what you changed"
```

Example:
```bash
git add .
git commit -m "Updated primary button color to purple"
```

### Step 2: Push to GitHub

```bash
git push origin your-branch-name
```

### Step 3: Create a Pull Request

1. Go to the repository on GitHub
2. You'll see a banner asking to create a Pull Request
3. Click "Compare & pull request"
4. Add a description of your changes
5. Click "Create pull request"

### Step 4: Get Your Preview URL

- Vercel will automatically build a preview
- A comment will appear on your PR with a unique URL
- Share this URL with teammates for feedback!

### Step 5: After Approval

Once approved, click "Merge pull request" and your changes go live!

---

## What You Can Safely Edit

### ✅ Safe to Edit

| File/Folder | What's Inside | How to Edit |
|-------------|--------------|-------------|
| `src/data/*.json` | Mock data (accounts, transactions, users) | Change values directly |
| `src/components/core/*` | Custom components | Modify styles, layout |
| `src/pages/*` | Page layouts | Rearrange, add sections |
| `src/index.css` | Design tokens (colors, fonts, spacing) | Update CSS variables |

### ❌ Avoid Editing

| File/Folder | Why |
|-------------|-----|
| `src/components/ui/*` | Auto-generated shadcn/ui components |
| `node_modules/` | External dependencies |
| `package.json` | Project configuration |
| Config files at root | Build configuration |

---

## Component & Typography Galleries

The prototype includes interactive galleries where you can view all design system elements.

### Component Gallery

1. Start the dev server (`npm run dev`)
2. Click **Components** in the navigation header
3. Or navigate to [http://localhost:5173/components](http://localhost:5173/components)

**What's in the Component Gallery:**
- **All Core Components**: Header, AccountCard, TransactionRow
- **All Variants**: See every state and variation of each component
- **Usage Tracking**: See which files use each component
- **Search**: Filter components by name or description
- **Live Previews**: Interactive previews of each component state

### Typography Gallery

1. Start the dev server (`npm run dev`)
2. Click **Typography** in the navigation header
3. Or navigate to [http://localhost:5173/typography](http://localhost:5173/typography)

**What's in the Typography Gallery:**
- **All Text Styles**: Title, body, label, and micro text styles
- **Live Previews**: See how each typography style renders
- **Specifications**: Font size, weight, line height for each style
- **Real-World Examples**: Complete UI examples using typography
- **Code Snippets**: Copy-paste examples for each style

### Using the Galleries for Design Work

The galleries are perfect for:
- **Testing typography and color changes** across all elements at once
- **Comparing variants** side by side
- **Finding components** to reuse in your designs
- **Understanding text hierarchy** and component states
- **Learning the design system** quickly

---

## Common Tasks

### Changing Colors

Open `src/index.css` and update the CSS variables:

```css
:root {
  --color-primary: #5746af;     /* Change this hex code */
  --color-accent: #00d4aa;       /* Or this one */
}
```

### Typography

This app uses **Arcadia** as its exclusive font family. Arcadia is a variable font, which means you can use any weight from 100 to 900 without loading separate font files.

#### Font Families Available

- **Arcadia** (via `--font-sans`) - Used for all body text and UI elements
- **Arcadia Display** (via `--font-display`) - Used for headings and display text

Both fonts support:
- Variable font weights (100-900)
- Italic styles
- Smooth weight transitions for animations

#### Using Typography in Components

Use design system utility classes with the font variables:

```tsx
// Regular text (default)
<p className="text-body">This uses Arcadia</p>

// Display text for headings
<h1 className="text-title-primary font-display">Display Heading</h1>

// Different weights
<p className="font-light">Light text (300)</p>
<p className="font-normal">Normal text (400)</p>
<p className="font-semibold">Semibold text (600)</p>
<p className="font-bold">Bold text (700)</p>
```

#### Font Files Location

Font files are stored in `public/fonts/`:
- `ArcadiaText-VariableVF.woff2` - Regular text
- `ArcadiaTextItalic-VariableVF.woff2` - Italic text
- `ArcadiaDisplay-VariableVF.woff2` - Display headings
- `ArcadiaDisplayItalic-VariableVF.woff2` - Display italic

Font definitions are in `src/fonts.css`, imported automatically by `src/index.css`.

### Changing Mock Data

#### Update Account Balances

Edit `src/data/accounts.json`:

```json
{
  "accounts": [
    {
      "name": "Mercury Checking",
      "balance": 125750.42    // Change this number
    }
  ]
}
```

#### Add a New Transaction

Edit `src/data/transactions.json`:

```json
{
  "transactions": [
    // Add a new object to this array:
    {
      "id": "txn_new",
      "description": "New Transaction",
      "merchant": "Company Name",
      "amount": -100.00,
      "type": "debit",
      "date": "2024-12-19",
      "category": "Software",
      "status": "completed",
      "accountId": "acc_001"
    }
  ]
}
```

### Modifying a Component

Edit files in `src/components/core/`. For example, to change the AccountCard:

```tsx
// src/components/core/AccountCard.tsx

// Find the Card component and modify its className
<Card className="cursor-pointer transition-all hover:shadow-lg">
```

---

## Troubleshooting

### "npm: command not found"

Node.js isn't installed. Go back to [One-Time Setup](#one-time-setup).

### "Cannot find module..."

Run `npm install` to reinstall dependencies.

### The page won't load

1. Make sure the dev server is running (`npm run dev`)
2. Check the terminal for error messages
3. Try refreshing the browser

### My changes aren't showing

1. Make sure you saved the file
2. Check if the terminal shows any errors
3. Try stopping and restarting the server (`Ctrl+C`, then `npm run dev`)

### I broke something!

Don't panic! You have options:

**Option 1: Undo in your editor**
Press `Cmd+Z` (Mac) or `Ctrl+Z` (Windows)

**Option 2: Discard all changes**
```bash
git checkout .
```

**Option 3: Start fresh**
```bash
git checkout main
git pull
```

### Git says there are conflicts

Ask a developer for help, or:
```bash
git checkout main
git pull
git checkout -b your-name/new-branch
```
Then start your changes again.

---

## Need Help?

- **Slack**: Post in #design-eng-help
- **GitHub Issues**: Create an issue in the repository
- **Documentation**: Check this guide first!

---

## Glossary

| Term | Meaning |
|------|---------|
| **Repository (Repo)** | The project folder containing all code |
| **Branch** | A separate version of the code for your changes |
| **Commit** | A saved snapshot of your changes |
| **Pull Request (PR)** | A request to merge your changes into the main project |
| **Merge** | Combining your changes with the main project |
| **npm** | Node Package Manager - installs project dependencies |

