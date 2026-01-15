# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wayfinder Frontend is a Next.js-based landing page for the Wayfinder LLM routing control plane. The site features an animated API demonstration (inspired by ipinfo.io) that showcases Wayfinder's policy enforcement, intelligent routing, and semantic caching capabilities.

## Development Commands

```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type check without emitting files
npm run type-check

# Install dependencies (use temporary cache if npm cache has permission issues)
npm install --cache /tmp/npm-cache
```

## Architecture

### Framework & Routing

- **Next.js 15 App Router**: File-based routing in `src/app/`
- **TypeScript (strict mode)**: All source files use TypeScript with strict type checking
- **Server Components by default**: Use `'use client'` directive for components requiring client-side interactivity

### Styling

- **Tailwind CSS**: Utility-first CSS framework with custom theme
- **Dark Mode**: Class-based dark mode via `next-themes` (default: dark)
- **Custom Colors**: Brand blues (`brand-*`) and accent purples (`accent-*`)
- **Custom Typography**: Hero, h1, h2, h3 sizes defined in `tailwind.config.ts`

### Key Components

#### AnimatedAPIDemo (`src/components/landing/AnimatedAPIDemo.tsx`)

The centerpiece component that cycles through 3 scenarios demonstrating Wayfinder's capabilities:

1. **Policy Enforcement**: Shows how token-scoped rules filter models
2. **Intelligent Routing**: Displays primary/alternate model recommendations
3. **Semantic Caching**: Demonstrates cache hits and cost savings

**Animation Flow**:
- Cycles every 12 seconds
- Uses `useTypingEffect` hook for character-by-character typing (20ms per char)
- Uses `useCycleScenarios` hook for automatic scenario rotation
- Framer Motion for smooth transitions between scenarios
- Split-screen layout: Request (left) → Response (right)

#### Custom Hooks

**`useTypingEffect`** (`src/hooks/useTypingEffect.ts`):
- Character-by-character text animation using requestAnimationFrame
- Returns `{ displayText, isComplete }`
- Used for typing out JSON in API demo

**`useCycleScenarios`** (`src/hooks/useCycleScenarios.ts`):
- Automatic scenario rotation with configurable interval
- Returns `{ currentScenario, currentIndex }`
- Used to cycle through API demo scenarios

### Data Structure

**Scenarios** (`src/lib/scenarios.ts`):
- Contains realistic Wayfinder API request/response examples
- Type-safe with `Scenario` interface from `src/types/scenarios.ts`
- Three scenarios: policy, routing, caching
- To add a new scenario: Add to array, update ScenarioId type

### Component Patterns

- **Container**: Max-width wrapper with responsive padding (use for all sections)
- **Button**: Variants (primary, secondary, ghost) and sizes (sm, md, lg)
- **CodeBlock**: Syntax-highlighted code with Prism.js (atomDark theme)

### Layout Structure

```
RootLayout (src/app/layout.tsx)
└── ThemeProvider
    ├── Header (sticky nav with logo, links, theme toggle)
    ├── Main (page content)
    └── Footer (links, social, copyright)
```

### Landing Page Sections (src/app/page.tsx)

1. **HeroSection**: Headline, subheadline, CTA, AnimatedAPIDemo
2. **FeaturesSection**: 4 features in 2x2 grid (Policy, Routing, Caching, Knowledge Store)
3. **UseCasesSection**: 3 use cases (SaaS, AI Aggregators, Enterprise)
4. **CTASection**: Final call-to-action with gradient background

## Future Additions

### Authentication (Planned)

When adding auth, use NextAuth.js:
- Create routes in `src/app/(auth)/login` and `src/app/(auth)/signup`
- Update Header to show user menu when authenticated
- Add middleware for protected routes

### Session Configuration (Planned)

Routes to add:
- `/session/new` - Create new session
- `/session/[id]` - View/edit session
- `/session/[id]/edit` - Edit mode

Consider adding state management (Zustand/Jotai) if session state becomes complex.

### Pricing Pages (Planned)

Routes to add:
- `/pricing` - Comparison table
- `/pricing/free` - Free tier details
- `/pricing/paid-system` - Paid system tier
- `/pricing/paid-byollm` - Paid BYOLLM tier

## Important Notes

- **Dark Mode First**: Design with dark mode as the default aesthetic
- **Mobile Responsive**: All components must work on mobile (test at 375px width)
- **Animation Performance**: Use `prefers-reduced-motion` media query for accessibility
- **Type Safety**: Enable strict TypeScript checks, avoid `any` types
- **Import Aliases**: Use `@/*` for absolute imports (e.g., `@/components/ui/Button`)

## Troubleshooting

### npm install fails with EACCES

Use temporary cache directory:
```bash
npm install --cache /tmp/npm-cache
```

### Hydration errors

Ensure client components use `'use client'` directive and check for SSR/client mismatches (especially with theme provider).

### Dark mode not persisting

Check that ThemeProvider is wrapping the app in `layout.tsx` and `suppressHydrationWarning` is set on `<html>` tag.
