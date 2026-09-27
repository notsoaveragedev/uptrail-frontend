# Uptrail frontend

Uptime monitoring with live dashboards, rule-based alerts, incidents and public status pages.

## Stack

React 19 · TypeScript (strict) · Vite · React Router (data router) · antd v6 · Tailwind CSS v4 · TanStack Query · zod

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Scripts

| Script              | What it does                                  |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Start the dev server                          |
| `npm run build`     | Type-check and build for production           |
| `npm run typecheck` | Type-check only                               |
| `npm run lint`      | Lint with ESLint                              |
| `npm run format`    | Format with Prettier (sorts Tailwind classes) |
| `npm run preview`   | Serve the production build                    |

## Project structure

```
src/
  components/   shared UI, error boundaries, layout pieces
  layouts/      route layouts rendered around an <Outlet />
  lib/          helpers (lazy route loading, query client)
  pages/        route pages, lazy-loaded per route
  theme/        palette tokens, antd theme, theme mode provider
  router.tsx    route tree
  main.tsx      app providers
```

## Theme

The "Ember" design system lives in `src/theme/palette.ts` and is mirrored as CSS variables in `src/index.css`, so antd components and Tailwind classes share one palette in dark and light mode.
