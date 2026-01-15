# Repository Guidelines

## Project Structure & Module Organization
- `src/app/` holds Next.js App Router pages and layouts (e.g., `src/app/page.tsx`, `src/app/api-reference/page.tsx`).
- `src/components/` contains UI, layout, and landing sections.
- `src/hooks/` contains reusable React hooks.
- `src/lib/` contains local data and utilities (e.g., demo scenarios).
- `src/types/` contains shared TypeScript types.
- `public/` is not used yet; add static assets there if needed.

## Build, Test, and Development Commands
- `npm run dev` — start the local Next.js dev server at `http://localhost:3000`.
- `npm run build` — production build for deployment.
- `npm start` — run the production build.
- `npm run lint` — run ESLint.
- `npm run type-check` — TypeScript type checking (`tsc --noEmit`).

## Coding Style & Naming Conventions
- TypeScript + React with functional components.
- Indentation: 2 spaces.
- Components: `PascalCase` file and export names.
- Hooks: `useX` naming (e.g., `useTypingEffect`).
- Tailwind CSS for styling; prefer utility classes and existing color tokens (`brand`, `accent`).

## Testing Guidelines
- No test framework is configured yet.
- If adding tests, document the framework and add a `npm run test` script.

## Commit & Pull Request Guidelines
- Commit messages are short, imperative, and descriptive (e.g., `Initial frontend site`).
- PRs should include:
  - A clear summary of UI changes.
  - Screenshots or short clips for visual updates.
  - Notes on any new endpoints, env vars, or config changes.

## Security & Configuration Notes
- Waitlist form posts to `/api/signup`; backend is not in this repo.
- Managed API docs are at `/api-reference` and should reflect public endpoints only.
