# AGENTS.md

Guidelines for agentic coding in this repository.

## Build Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Fix SPA for GitHub Pages deployment (run after build)
npm run fix-spa

# Full build pipeline
npm run build && npm run fix-spa
```

## Lint Commands

```bash
# Run ESLint
npm run lint

# Type check with TypeScript (no emit)
npm run typecheck

# Or run tsc directly
npx tsc --noEmit
```

## Code Style Guidelines

### Formatting
- **Prettier**: Configured with 2-space tabs, 80 print width, trailing commas (ES5)
- **Double quotes** for strings, **semicolons** required
- **Arrow function parentheses** always required
- Run `npm run lint` before committing

### Imports
- Group imports: React/Remix → Third-party libraries → Local modules
- Use path alias `~/` for local imports (configured in `tsconfig.json`)
- Example:
  ```typescript
  import { useState } from "react";
  import { Button } from "@mantine/core";
  import { BASE_INDEX, SI_PREFIXES } from "~/utils/consts";
  ```

### Types & Naming
- **TypeScript strict mode** enabled
- Use **PascalCase** for components, interfaces, and types
- Use **camelCase** for functions, variables, and hooks
- Use **UPPER_SNAKE_CASE** for constants
- Use explicit return types for exported functions
- Prefer `interface` over `type` for object shapes
- Use `React.ReactNode` for children props

### React Conventions
- Use functional components with hooks
- Use `forwardRef` for component ref forwarding (name the function)
- Destructure props in component parameters
- Use `useCallback` and `useMemo` for expensive computations
- Keep components focused and extract complex logic to hooks

### Component Structure
```typescript
import { forwardRef } from "react";

interface Props {
  label: string;
  value: number;
}

export const MyComponent = forwardRef<HTMLDivElement, Props>(
  function MyComponent({ label, value }, ref) {
    return <div ref={ref}>{label}: {value}</div>;
  }
);
```

### State Management
- Use React hooks (`useState`, `useReducer`) for local state
- Lift state up when needed
- Use URL state for shareable/filterable data

### Error Handling
- Use `console.assert()` for debug assertions
- Handle async errors with try/catch
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Avoid silent failures - log or surface errors

### Styling
- Use **Mantine components** and theme system as primary UI
- TailwindCSS available for custom styling (in `tailwind.config.ts`)
- Mantine styles override with `styles` prop or CSS-in-JS
- CSS variables: `var(--mantine-color-gray-4)`
- Dark theme enforced: `forceColorScheme="dark"`

### Routing
- Remix flat routes convention in `app/routes/`
- File naming: `route.subroute.tsx` maps to `/route/subroute`
- `_index.tsx` for index routes
- `_layout.tsx` for layout routes (prefix with underscore)

### Utilities
- Place shared constants in `app/utils/`
- Export constants as `UPPER_SNAKE_CASE`
- Group related constants in objects

## Project Structure

```
app/
  components/     # Reusable UI components
  routes/         # Remix route files (flat routes)
  utils/          # Shared constants and utilities
  root.tsx        # Root layout with MantineProvider
  entry.client.tsx
  entry.server.tsx
build/client/     # Static build output
public/           # Static assets
```

## GitHub Pages Deployment

- Static SPA deployed to GitHub Pages
- `fix-spa.js` script copies `index.html` to all route directories
- Routes must be navigable via direct URL access

## Environment

- **Node**: >= 20.0.0
- **Package Manager**: npm
- **Framework**: Remix (SPA mode, no SSR)
- **UI Library**: Mantine v8
- **Build Tool**: Vite
