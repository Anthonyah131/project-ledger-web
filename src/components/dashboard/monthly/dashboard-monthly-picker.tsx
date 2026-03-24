import { useState, useCallback } from "react"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { formatMonthKey } from "@/lib/date-utils"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DashboardMonthlyPickerProps {
  selectedMonth: string
  onSelectMonth: (monthKey: string) => void
  loading?: boolean
}

export function DashboardMonthlyPicker({
  selectedMonth,
  onSelectMonth,
  loading,
}: DashboardMonthlyPickerProps) {
  const [open, setOpen] = useState(false)
  const [pickerYear, setPickerYear] = useState(() => {
    return selectedMonth ? Number(selectedMonth.split("-")[0]) : new Date().getFullYear()
  })

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      // Reset picker year to match currently selected month
      setPickerYear(selectedMonth ? Number(selectedMonth.split("-")[0]) : new Date().getFullYear())
    }
  }, [selectedMonth])

  const handleMonthClick = useCallback((monthIndex: number) => {
    const monthFormatted = String(monthIndex + 1).padStart(2, "0")
    const newMonthKey = `${pickerYear}-${monthFormatted}`
    onSelectMonth(newMonthKey)
    setOpen(false)
  }, [pickerYear, onSelectMonth])

  const displayLabel = formatMonthKey(selectedMonth, selectedMonth)
  
  const currentMonthKey = (() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })()

  // Generate localized short month names (Jan, Feb, etc)
  const monthNames = Array.from({ length: 12 }).map((_, i) => {
    const d = new Date(2000, i, 1)
    return d.toLocaleString("es", { month: "short" }).replace(".", "").toUpperCase()
  })

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={loading}
          className="min-w-40 justify-center bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:text-primary transition-colors font-medium"
        >
          {displayLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="center">
        <div className="flex items-center justify-between space-x-2 pb-4">
          <Button
            variant="outline"
            className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
            onClick={() => setPickerYear((y) => y - 1)}
            aria-label="Año anterior"
          >
            <IconChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">{pickerYear}</div>
          <Button
            variant="outline"
            className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
            disabled={pickerYear >= new Date().getFullYear()}
            onClick={() => setPickerYear((y) => y + 1)}
            aria-label="Año siguiente"
          >
            <IconChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {monthNames.map((name, index) => {
            const thisMonthKey = `${pickerYear}-${String(index + 1).padStart(2, "0")}`
            const isSelected = thisMonthKey === selectedMonth
            const isFuture = thisMonthKey > currentMonthKey
            return (
              <Button
                key={index}
                variant={isSelected ? "default" : "ghost"}
                className={`h-9 w-full rounded-md text-xs font-medium transition-colors ${
                  isSelected ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-accent hover:text-accent-foreground"
                }`}
                disabled={isFuture}
                onClick={() => handleMonthClick(index)}
              >
                {name}
              </Button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
