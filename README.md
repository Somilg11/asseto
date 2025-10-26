# asseto

![asseto landing](public/asseto-landing.png)
![asseto dashboard](public/asseto-dashboard.png)

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2F855A?logo=prisma&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0%2B-38B2AC?logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-LTS-339933?logo=node.js&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-charts-ef4444)
![Stack Auth](https://img.shields.io/badge/stack--auth-auth-blue)
![NeonDB](https://img.shields.io/badge/NeonDB-database-06b6d4)

Small inventory & dashboard application built with Next.js (app router), Prisma, and Tailwind CSS. The app demonstrates server components, server actions, Prisma data access, and responsive UI patterns tailored for inventory and product management.

---

## Quick links

- Source: this repository
- App root: `app/`
- Prisma schema: `prisma/schema.prisma`

## Features

- Inventory listing with server-side search and pagination
- Add / Edit / Delete products via server actions
- Settings persisted to a local JSON file (for dev/demo)
- Dashboard with summary metrics and responsive layout
- Mobile-first UI using Tailwind CSS

## Tech stack

- Next.js (App Router, Server Components, Server Actions)
- React 19 + TypeScript
- Prisma (Postgres) as ORM
- Tailwind CSS for styling
- Recharts (available) for charts
 - stack-auth (authentication)
 - NeonDB (production Postgres-compatible database)

## Badges / status

| Item | Status |
|---|---|
| Dev server | npm run dev |
| Build | npm run build |

---

## Getting started

Prerequisites:

- Node.js LTS (v18+ recommended)
- A Postgres database (or set `DATABASE_URL` to a valid connection string)

Install dependencies:

```powershell
npm install
```

Copy environment variables (create `.env`):

```text
# .env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Run Prisma migrations and generate client:

```powershell
npx prisma migrate dev --name init
npx prisma generate
```

Seed (if provided):

```powershell
node prisma/seed.js
```

Start dev server:

```powershell
npm run dev
```

Build for production:

```powershell
npm run build
npm run start
```

Troubleshooting:

- If Next complains about `searchParams` being a Promise, ensure server components `await` the `searchParams` when they accept it as a prop.
- If forms are wired to server-action functions, do not set `method` or `encType` on the `<form>` element — let Next handle the POST invocation.

## Project structure (high level)

```
app/
  ├─ inventory/        # inventory page (search, pagination, responsive)
  ├─ add-product/      # add/edit product page
  ├─ dashboard/        # dashboard & charts
  ├─ settings/         # settings page
components/            # shared components (sidebar, charts, etc)
lib/
  ├─ actions/          # server actions (products, settings)
  ├─ prisma.ts         # prisma client wrapper
  ├─ auth.ts           # getCurrentUser helper
prisma/
  ├─ schema.prisma
  ├─ seed.ts
public/
```

## How the app works (contract)

- Inputs: HTTP requests to the app routes (pages) with optional query params `q`, `page`, `pageSize`.
- Outputs: HTML rendered by server components + JSON responses when server actions redirect.
- Data shape: `Product` model (id, name, sku, price: Decimal, quantity, lowStockAt, createdAt, updatedAt).

Error modes:

- Auth: `getCurrentUser()` redirects to `/sign-in` when not authenticated.
- Validation: server actions validate required fields and redirect back with query flags (e.g., `?saved=1`).

## Server actions pattern

Server actions live under `lib/actions/*` and are used as form `action` handlers. Example:

```tsx
// form in a server component
<form action={addProduct}>
  <input name="name" />
  <button type="submit">Add</button>
</form>
```

Notes:

- Do not specify `method` on forms that use function actions.
- Server actions run on the server and can call Prisma directly.

## Settings & currency

- Settings are persisted to `data/settings.json` (lightweight dev store). A utility `lib/utils/currency.ts` reads the currency code and maps to a symbol used across pages (Inventory, Dashboard).

## Flow diagram

Below is a rendered SVG flow diagram that visualizes the main request flow (Browser → Next.js → Server Component → Prisma → Database) and the server-action flow for form submissions.

![Flow diagram](/diagram.svg)

If your environment does not render the SVG inline, open `public/diagram.svg` directly or view it in a browser.

## Development notes & recommended improvements

- Move settings storage to the database via Prisma for production readiness.
- Add confirmation modal for Delete (client component) to avoid accidental deletes.
- Add Recharts-based charts (client components) for richer Dashboard visuals. Recharts is already installed and available.
- Add tests: unit tests for server actions and end-to-end tests for pages.

## Contributing

1. Fork the repository
2. Create a branch: `feature/your-feature`
3. Make changes, run linting and tests
4. Open a pull request describing the change

## License

This project does not include a license file. Add one if you intend to share publicly (MIT recommended for demos).

---

If you'd like, I can also:

- Add a smaller README inside `app/` or `prisma/` with focused dev steps.
- Generate a README badge that reflects CI status after you add CI.

Generated on: 2025-10-26
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
