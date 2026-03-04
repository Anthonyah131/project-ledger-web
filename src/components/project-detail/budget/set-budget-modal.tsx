"use client"

import { Input } from "@/components/ui/input"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { FormModal } from "@/components/shared/form-modal"
import { useSetProjectBudgetForm } from "@/hooks/forms/use-project-budget-form"
import type {
  ProjectBudgetResponse,
  SetProjectBudgetRequest,
} from "@/types/project-budget"

interface SetProjectBudgetModalProps {
  open: boolean
  budget: ProjectBudgetResponse | null
  projectCurrency: string
  onClose: () => void
  onSave: (data: SetProjectBudgetRequest) => void
}

export function SetProjectBudgetModal({
  open,
  budget,
  projectCurrency,
  onClose,
  onSave,
}: SetProjectBudgetModalProps) {
  const { form, onSubmit, handleClose } = useSetProjectBudgetForm({
    budget,
    onSave,
    onClose,
  })

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title={budget ? "Editar presupuesto" : "Configurar presupuesto"}
      description="Define el monto máximo del proyecto y cuándo quieres recibir alerta por consumo."
      form={form}
      onSubmit={onSubmit}
      submitLabel={budget ? "Guardar cambios" : "Guardar presupuesto"}
      contentClassName="sm:max-w-sm"
    >
      <FormField
        control={form.control}
        name="totalBudget"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Monto total ({projectCurrency}) *</FormLabel>
            <FormControl>
              <Input type="number" step="0.01" min="0" autoFocus {...field} />
            </FormControl>
            <p className="text-[11px] text-muted-foreground">
              Monto total disponible para cubrir todos los gastos del proyecto.
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="alertPercentage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Alerta al (%) *</FormLabel>
            <FormControl>
              <Input type="number" min="1" max="100" step="1" {...field} />
            </FormControl>
            <p className="text-[11px] text-muted-foreground">
              Ejemplo: 80 significa alertar cuando se haya gastado el 80% del presupuesto.
            </p>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormModal>
  )
}
