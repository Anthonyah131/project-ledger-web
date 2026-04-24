# Testing Guide

## Overview

Project Ledger Web uses **Vitest** as the test runner with **Testing Library** for React component testing. The test suite consists of **823 tests** across **73 test files**.

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch
```

## Test Structure

```
tests/
├── setup.ts                    # Vitest setup (jest-dom matchers)
├── api-client.test.ts          # API client tests
├── components/                 # UI component tests
│   ├── accordion.test.tsx
│   ├── alert.test.tsx
│   ├── avatar.test.tsx
│   ├── badge.test.tsx
│   ├── button.test.tsx
│   ├── card.test.tsx
│   ├── checkbox.test.tsx
│   ├── dialog.test.tsx
│   ├── dropdown-menu.test.tsx
│   ├── input.test.tsx
│   ├── label.test.tsx
│   ├── popover.test.tsx
│   ├── select.test.tsx
│   ├── separator.test.tsx
│   ├── sheet.test.tsx
│   ├── skeleton.test.tsx
│   ├── switch.test.tsx
│   ├── tabs.test.tsx
│   ├── textarea.test.tsx
│   └── tooltip.test.tsx
├── hooks/                      # Custom hook tests
│   ├── use-debounced-value.test.ts
│   └── use-mobile.test.ts
├── mocks/                       # Mock utilities
│   └── api-client-mock.ts
├── services/                    # API service tests
│   ├── admin-user-service.test.ts
│   ├── auth-service.test.ts
│   ├── billing-service.test.ts
│   ├── budget-service.test.ts
│   ├── category-service.test.ts
│   ├── expense-service.test.ts
│   ├── income-service.test.ts
│   ├── obligation-service.test.ts
│   ├── partner-service.test.ts
│   ├── partner-settlement-service.test.ts
│   ├── payment-method-service.test.ts
│   ├── plan-service.test.ts
│   ├── project-service.test.ts
│   ├── user-service.test.ts
│   └── workspace-service.test.ts
├── shared/                      # Shared component tests
│   ├── app-footer.test.tsx
│   ├── budget-progress-badge.test.tsx
│   ├── delete-confirm-modal.test.tsx
│   ├── empty-state.test.tsx
│   ├── form-modal.test.tsx
│   ├── item-action-menu.test.tsx
│   ├── pagination.test.tsx
│   └── plan-locked-state.test.tsx
├── utils/                       # Utility function tests
│   ├── animations-gsap.test.ts
│   ├── billing-utils.test.ts
│   ├── bulk-import-utils.test.ts
│   ├── constants.test.ts
│   ├── date-utils.test.ts
│   ├── document-extraction-utils.test.ts
│   ├── error-utils.test.ts
│   ├── format-utils.test.ts
│   ├── payment-method-utils.test.ts
│   ├── seo.test.ts
│   ├── split-utils.test.ts
│   └── utils.test.ts
└── validations/                 # Zod validation schema tests
    ├── admin-user.test.ts
    ├── auth.test.ts
    ├── bulk-import.test.ts
    ├── category.test.ts
    ├── date-utils.test.ts
    ├── expense.test.ts
    ├── income.test.ts
    ├── member.test.ts
    ├── obligation.test.ts
    ├── partner-settlement.test.ts
    ├── partner.test.ts
    ├── payment-method.test.ts
    ├── project-budget.test.ts
    ├── project.test.ts
    └── workspace.test.ts
```

## Test Categories

| Category | Files | Purpose |
|----------|-------|---------|
| **Components** | 20 | UI component rendering and behavior |
| **Shared** | 8 | Cross-feature reusable components |
| **Services** | 14 | API client and REST operations |
| **Utils** | 13 | Pure utility functions |
| **Validations** | 15 | Zod schema validation |
| **Hooks** | 2 | Custom React hooks |

## Writing Tests

### Basic Component Test

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MyComponent } from "@/components/my-component";

vi.mock("@/context/language-context", () => ({
  useLanguage: () => ({
    t: (key: string) => key,
  }),
}));

describe("my-component", () => {
  it("should render correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("expected text")).toBeDefined();
  });
});
```

### Testing Radix UI Components

Radix UI components (Dialog, DropdownMenu, etc.) render via portals outside the test container. Always use `afterEach` cleanup:

```tsx
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});
```

### Testing Async State

For state updates after interactions, use `waitFor`:

```tsx
import { waitFor } from "@testing-library/react";

it("should show loading state", async () => {
  render(<MyComponent />);
  fireEvent.click(screen.getByText("Submit"));

  await waitFor(() => {
    expect(screen.getByText("Loading...")).toBeDefined();
  });
});
```

### Mocking Next.js Router

```tsx
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));
```

## Configuration

**Vitest config** (`vitest.config.ts`):
- Environment: `jsdom`
- Setup file: `./tests/setup.ts`
- CSS: enabled
- Alias: `@` → `src/`

**Setup file** (`tests/setup.ts`):
- Imports `@testing-library/jest-dom/vitest` for enhanced matchers

## Best Practices

1. **Mock context** - Always mock `useLanguage` when testing components that use i18n
2. **Clean up** - Use `afterEach(() => cleanup())` for components with Radix UI portals
3. **Avoid `screen.getBy*` in assertions** - Use `expect(...).toBeDefined()` instead
4. **Use `getAllBy*` for multiple elements** - When multiple matching elements exist (e.g., pagination dots)
5. **Wait for async updates** - Use `waitFor` when testing state changes after interactions
