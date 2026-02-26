// components/shared/empty-state.tsx
// Empty state placeholder — shown when a list or section has no data

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return null;
}
