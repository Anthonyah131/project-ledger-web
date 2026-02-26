// components/shared/confirm-dialog.tsx
// Reusable confirmation dialog — used for destructive actions

interface ConfirmDialogProps {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  open: boolean;
}

export function ConfirmDialog({
  title,
  description,
  onConfirm,
  onCancel,
  open,
}: ConfirmDialogProps) {
  return null;
}
