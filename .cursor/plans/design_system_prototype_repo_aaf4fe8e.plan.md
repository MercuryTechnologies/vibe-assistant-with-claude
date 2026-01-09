---
name: Design System Prototype Repo
overview: Create a lightweight React prototype repository that mirrors your product's design system, allowing designers to clone, run locally, and iterate on UI without backend complexity.
todos:
  - id: init-project
    content: Initialize Vite + React + TypeScript project with minimal config
    status: completed
  - id: design-tokens
    content: Set up design tokens (colors, fonts, spacing) from Figma/Storybook
    status: completed
  - id: components
    content: Create or import core design system components
    status: completed
  - id: mock-data
    content: Build mock data system with editable JSON files
    status: completed
  - id: pages
    content: Create page templates mirroring product screens
    status: completed
  - id: vercel-config
    content: Configure Vercel deployment with branch previews
    status: completed
  - id: designer-docs
    content: Write comprehensive Designer Guide documentation
    status: completed
---

# Design System Prototype Repository

## Recommended Tech Stack

**Vite + React + TypeScript** is my top recommendation because:

- Fastest dev server startup (sub-second)
- Minimal configuration
- Easy for designers with basic dev experience
- Excellent hot module replacement (changes appear instantly)

---

## Architecture Overview

```mermaid
flowchart TB
    subgraph repo [GitHub Repository]
        components[Components from Design System]
        mockData[Mock Data JSON files]
        pages[Page Templates]
        docs[Designer Guide]
    end
    
    subgraph local [Local Development]
        designer[Designer clones repo]
        npm[npm install + npm run dev]
        browser[localhost:5173]
    end
    
    subgraph deploy [Deployment]
        vercel[Vercel Preview]
        branch[Branch Previews]
    end
    
    repo --> designer
    designer --> npm
    npm --> browser
    repo --> vercel
    vercel --> branch
```

---

## Component Strategy

Since you have **both Storybook and Figma**, you have two options:

### Option A: Import from npm package (Recommended if available)

If your components are published as an npm package, install them directly:

```bash
npm install @your-org/design-system
```

This keeps you in sync with the latest design system changes automatically.

### Option B: Recreate components locally

If components aren't packaged, create a `/components` folder mirroring your Storybook structure. Use Figma's Dev Mode to extract exact styles, tokens, and spacing.---

## Mock Data Structure

Create a `/data` folder with JSON files that are easy for designers to edit:

```javascript
/data
  accounts.json      # Account balances, types
  transactions.json  # Transaction history
  users.json         # User profiles
  settings.json      # App configuration
```

Example `transactions.json`:

```json
{
  "transactions": [
    {
      "id": "txn_001",
      "description": "Stripe",
      "amount": -1250.00,
      "date": "2024-12-18",
      "category": "Software"
    }
  ]
}
```

Designers can modify these files without touching code.---

## Project Structure

```javascript
mercury-prototype/
├── public/
├── src/
│   ├── components/       # Design system components
│   ├── pages/            # Full page layouts
│   ├── data/             # Mock JSON data
│   ├── styles/           # Global styles, fonts, tokens
│   ├── hooks/            # Data loading hooks
│   └── App.tsx
├── docs/
│   └── DESIGNER_GUIDE.md # How to use this repo
├── package.json
└── README.md
```

---

## Deployment Options Comparison

| Platform | Pros | Cons | Best For ||----------|------|------|----------|| **Vercel** | Free tier, automatic branch previews, zero config | Team features cost money | Your use case - familiar, reliable || **Netlify** | Similar to Vercel, good free tier | Slightly slower builds | Alternative if you want to try something new || **GitHub Pages** | Free, integrated with repo | No branch previews, manual setup | Static-only, budget option || **Cloudflare Pages** | Generous free tier, fast CDN | Less polished UI | Cost-conscious teams |**My recommendation: Stick with Vercel** since you're familiar with it. Key features for your use case:

- **Branch previews**: Every PR gets a unique URL for review
- **Instant rollbacks**: Easy to revert if something breaks
- **Zero config**: Just connect your GitHub repo

---

## Designer Workflow

```mermaid
sequenceDiagram
    participant D as Designer
    participant G as GitHub
    participant V as Vercel
    
    D->>G: Clone repository
    D->>D: npm install
    D->>D: npm run dev (local preview)
    D->>D: Edit components/data
    D->>G: Create branch + push
    G->>V: Triggers preview build
    V->>D: Preview URL for review
    D->>G: Create Pull Request
    G->>G: Team reviews changes
    G->>G: Merge to main
    V->>V: Auto-deploy to production
```

---

## Designer Guide Contents

The `DESIGNER_GUIDE.md` will include:

1. One-time setup instructions (install Node.js, clone repo)
2. Daily workflow (pull latest, create branch, make changes)
3. How to modify mock data
4. How to preview changes locally
5. How to submit changes (PR process)
6. Troubleshooting common issues

---

## Implementation Steps

1. **Initialize Vite + React project** with TypeScript
2. **Set up design tokens** (fonts, colors, spacing from your Figma)
3. **Create component structure** (either import from npm or build core components)
4. **Build mock data system** with JSON files and custom hooks
5. **Create page templates** mirroring your product screens
6. **Configure Vercel deployment** with branch previews
7. **Write Designer Guide** documentation
8. **Create example workflows** showing how to make common changes

---

## Maintenance Considerations

- **Keep dependencies minimal** - fewer updates to manage
- **Pin dependency versions** - prevents unexpected breaking changes
- **Use Renovate/Dependabot** - automated security updates
- **Document everything** - reduces support burden