import type { ComponentProps } from "react"
import { CalendarDays } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type DateInputProps = Omit<ComponentProps<typeof Input>, "type">

function DateInput({ className, ...props }: DateInputProps) {
  return (
    <div className="relative">
      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="date"
        className={cn(
          "pl-9 scheme-light dark:scheme-dark",
          "[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 hover:[&::-webkit-calendar-picker-indicator]:opacity-100",
          className,
        )}
        {...props}
      />
    </div>
  )
}

export { DateInput }
