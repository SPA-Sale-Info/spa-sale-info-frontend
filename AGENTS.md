# Repository Guidelines

## Project Structure & Module Organization
- `pages/` defines routed screens; top-level files map to Next.js routes and should stay presentation-focused.
- `components/` holds shared React UI pieces (e.g., `ProductCard.js`) that lean on CSS modules under `styles/`.
- `utils/` stores browser-safe helpers; prefer colocating domain-specific logic here over duplicating inline.
- `public/` contains static assets served verbatim, while `styles/` manages global CSS and module-specific styling.
- Use `.env.local` (see `.env.example`) for runtime secrets; never commit actual credentials.

## Build, Test, and Development Commands
- `npm run dev` launches the Next.js dev server with hot reload at `http://localhost:3000`.
- `npm run build` creates the production bundle; run it before deploying to catch SSR or TypeScript-adjacent issues.
- `npm run start` serves the optimized build—use for pre-deploy smoke tests.
- `npm run lint` applies the Next.js ESLint suite; run before pushing to keep CI green.

## Coding Style & Naming Conventions
- JavaScript, React 18 functional components, 2-space indentation, and single quotes are the baseline.
- Favor hooks and declarative state; avoid class components.
- Component files use PascalCase (`ProductCard.js`), hooks and utilities use camelCase (`useBrandFilter.js`, `formatPrice.js`).
- Lean on CSS modules with matching filenames (`ProductCard.module.css`); keep selectors scoped.

## Testing Guidelines
- No automated tests exist yet; linting plus manual cross-browser checks are required for each change.
- When adding tests, follow the `*.test.js` pattern under a `__tests__` folder colocated with the feature.
- Document manual verification steps in pull requests (device, browser, screen resolution).

## Commit & Pull Request Guidelines
- Match the existing conventional style: `Feat: ...`, `Fix: ...`, `Chore: ...` with a concise imperative summary (~50 chars).
- Reference issue IDs in the body when available and note any feature flags or config toggles.
- PRs must outline the problem, solution, test evidence (screenshots or terminal output), and any follow-up tasks.
- Keep PRs scoped to a single feature or bug; split larger changes into reviewable slices.

## Security & Configuration Tips
- Store API endpoints and tokens via environment vars; sync new keys by updating `.env.example`.
- Before publishing, verify `vercel.json` rewrites and redirects still align with the intended SPA domain.
