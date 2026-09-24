# TES Portal

Single portal for Transforming Experience School: facilitators track sessions,
groups, students, priesthood hours, attendance, assignments and payments. The
president and admin get the same tools across every facilitator, plus
org-wide analytics, Excel exports and (admin only) payment tracking.

All data is mock/demo data held in `localStorage` — there is no backend yet.
Demo accounts (password `password123` for all):

- Admin — `admin@tes.edu`
- President — `president@tes.edu`
- Facilitator — `facilitator@tes.edu` (or `mary@tes.edu`, `daniel@tes.edu`)

## Stack

- Vite + React 19 + TypeScript
- react-router-dom (routing), @tanstack/react-query (data fetching)
- styled-components (styling/theme, light + dark mode)
- react-hook-form + zod (forms/validation)
- chart.js / react-chartjs-2 (charts), xlsx (client-side Excel export)

## Architecture

Feature-based, modelled on a standard `features/` + `shared/` split:

```
src/
├── app/          # App shell, routing, providers, error boundary
├── features/     # One folder per domain area: api/, components/, pages/
├── shared/       # ui/ (design-system primitives), components/, lib/, hooks/
└── theme/        # styled-components theme + global style
```

## Development

```sh
npm install
npm run dev
```
