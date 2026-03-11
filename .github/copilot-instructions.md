# Project Guidelines

## Architecture

- This is a Next.js App Router app. Route groups live under `src/app/(auth)` and `src/app/(dashboard)`.
- Keep route protection in route group layouts with `AuthGuard`; do not add auth checks directly in individual pages. See `src/components/auth/auth-guard.tsx`.
- Keep pages and layouts thin. Put page-level client composition in `src/views/**`, reusable UI in `src/components/**`, domain hooks in `src/hooks/**`, and types in `src/types/**`.
- Services in `src/services/**` are thin HTTP wrappers over `src/lib/api-client.ts`. Put business logic, derived UI state, and toast handling in hooks or views, not in services.
- Reuse the centralized API client in `src/lib/api-client.ts` for all backend calls. Preserve its token refresh behavior and re-throw `AbortError` instead of converting canceled requests into network errors.

## Build And Test

- Use `npm run dev` for local development, `npm run build` for production builds, `npm run lint` for ESLint, `npm test` for a single Vitest run, and `npm run test:watch` while iterating.
- Tests use Vitest with jsdom and Testing Library. Put new tests under `tests/**` in a structure that mirrors `src/**`.
- When testing hooks or views that call services, mock the service module and `sonner` toast calls instead of making real network requests.

## Conventions

- Preserve the existing `@/` import alias style for app code.
- Follow the current domain-oriented structure: auth, dashboard, projects, reports, payment-methods, billing, admin, and shared/ui primitives.
- Prefer semantic theme tokens and shared utility classes over hardcoded Tailwind color values, especially in dashboard surfaces.
- Preserve existing Spanish user-facing copy and validation messages unless the task explicitly requires a language change.
- Keep validation schemas in `src/lib/validations/**` and infer form types from Zod schemas.
- For forms with different create and update behavior, keep separate create/update hooks instead of merging them into one generic hook.
- When adding environment variables, extend `src/types/env.d.ts` so `process.env` stays typed.

## React Guidance

- Avoid calling `setState` synchronously inside `useEffect` just to derive local state. Prefer `useMemo`, `useState` initializers, or updating state inside callbacks and subscriptions.
- Keep `useWatch` usage targeted to fields that drive reactive behavior; do not watch entire forms by default.
- Put error toasts in hooks or UI layers via shared helpers such as `toastApiError`, not inside service functions.

## Reference Files

- Use `src/lib/api-client.ts` as the template for HTTP client behavior and request cancellation handling.
- Use `src/services/project-service.ts` as the template for thin service-layer functions.
- Use `src/lib/validations/expense.ts` as the template for Zod validation and inferred form value types.
- Use `tests/hooks/projects/use-project-incomes.test.tsx` as the template for hook tests with mocked services.