Implement this design: {figma url}

Follow @figma-implementation-workflow.mdc and @figma-color-mapping.mdc throughout this process.

## Step 1: Fetch & Study the Design

Use the Figma MCP to get the design details for the node/frame at that URL. Before writing any code, understand:
- Layout structure and auto-layout settings
- Spacing values (padding, gap, margins)
- Colors (background, text, border, icon)
- Typography (font size, weight, line height)
- Border radius and shadows

## Step 2: Check for Existing Components

Before building custom UI, check @src/lib/component-registry/registry.ts for reusable DS components

Use existing components with appropriate props rather than rebuilding.

## Step 3: Build First Pass

Implement the design. It will be imperfect—that's expected.

## Step 4: Refinement Loop

Repeat until pixel-perfect:

1. Screenshot your implementation via Chrome DevTools MCP
2. Compare side-by-side with the Figma source
3. List every difference: spacing, color, typography, radius, shadows, borders, alignment
4. Fix each issue one by one, verifying in the browser
5. Loop until no differences remain

Be obsessive about details—the gap between "close enough" and "correct" is where polish lives.

## Step 5: Ask When Uncertain

If something in the design is ambiguous or impossible to implement as spec'd, ask me rather than guessing.