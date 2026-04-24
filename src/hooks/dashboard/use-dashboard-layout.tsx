/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useCallback, useEffect, useState } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

const LAYOUT_STORAGE_KEY = "project-ledger:dashboard-layout"

export type DashboardSectionId =
  | "summary-cards"
  | "budget-widget"
  | "payment-top-row"
  | "trend-chart"

const DEFAULT_LAYOUT: DashboardSectionId[] = [
  "summary-cards",
  "budget-widget",
  "payment-top-row",
  "trend-chart",
]

function readLayoutFromStorage(): DashboardSectionId[] {
  if (typeof window === "undefined") return DEFAULT_LAYOUT
  try {
    const raw = localStorage.getItem(LAYOUT_STORAGE_KEY)
    if (!raw) return DEFAULT_LAYOUT
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return DEFAULT_LAYOUT
    if (parsed.length === 0) return DEFAULT_LAYOUT
    const valid = parsed.filter((id): id is DashboardSectionId =>
      DEFAULT_LAYOUT.includes(id as DashboardSectionId)
    )
    const unique = [...new Set(valid)]
    const missing = DEFAULT_LAYOUT.filter((id) => !unique.includes(id))
    return [...unique, ...missing]
  } catch {
    return DEFAULT_LAYOUT
  }
}

function writeLayoutToStorage(layout: DashboardSectionId[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout))
}

export function useDashboardLayout() {
  const [layout, setLayout] = useState<DashboardSectionId[]>(DEFAULT_LAYOUT)
  const [activeId, setActiveId] = useState<DashboardSectionId | null>(null)
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)")
    const onChange = () => setIsDesktop(!mql.matches)
    onChange()
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  useEffect(() => {
    if (!isDesktop) {
      setLayout(DEFAULT_LAYOUT)
    } else {
      setLayout(readLayoutFromStorage())
    }
  }, [isDesktop])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as DashboardSectionId)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) return

    setLayout((prev) => {
      const oldIndex = prev.indexOf(active.id as DashboardSectionId)
      const newIndex = prev.indexOf(over.id as DashboardSectionId)
      if (oldIndex === -1 || newIndex === -1) return prev
      const newLayout = arrayMove(prev, oldIndex, newIndex)
      writeLayoutToStorage(newLayout)
      return newLayout
    })
  }, [])

  const resetLayout = useCallback(() => {
    setLayout(DEFAULT_LAYOUT)
    writeLayoutToStorage(DEFAULT_LAYOUT)
  }, [])

  return {
    layout,
    sensors,
    activeId,
    handleDragStart,
    handleDragEnd,
    resetLayout,
    isMobile: !isDesktop,
    isDesktop,
  }
}

interface SortableSectionProps {
  id: DashboardSectionId
  isMobile?: boolean
  children: React.ReactNode
}

export function SortableSection({ id, isMobile, children }: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: isMobile })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  if (isMobile) {
    return <section className="contents">{children}</section>
  }

  return (
    <section
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-2xl border border-border/70 shadow-[0_4px_20px_0_rgba(140,92,255,0.1)] transition-all duration-300",
        isDragging
          ? "border-primary/50 opacity-50 shadow-2xl ring-2 ring-primary/20"
          : ""
      )}
      {...attributes}
    >
      <div
        {...listeners}
        className={cn(
          "absolute left-0 top-1/2 z-10 flex -translate-y-1/2 cursor-grab items-center justify-center rounded-md p-1.5 text-muted-foreground transition-all duration-150",
          isDragging ? "cursor-grabbing opacity-100 text-primary" : "opacity-0 group-hover:opacity-100 hover:bg-muted/80 hover:text-foreground"
        )}
        aria-label="Arrastrar para reordenar"
      >
        <GripVertical className="size-4 shrink-0" />
      </div>
      <div className="py-3 px-4">
        {children}
      </div>
    </section>
  )
}

interface DashboardDndProviderProps {
  sensors: ReturnType<typeof useSensors>
  handleDragStart: (event: DragStartEvent) => void
  handleDragEnd: (event: DragEndEvent) => void
  layout: DashboardSectionId[]
  activeId: DashboardSectionId | null
  children: React.ReactNode
}

const SECTION_LABELS: Record<DashboardSectionId, string> = {
  "summary-cards": "Resumen",
  "budget-widget": "Presupuesto",
  "payment-top-row": "Pagos y Transacciones",
  "trend-chart": "Tendencias",
}

export function DashboardDndProvider({
  sensors,
  handleDragStart,
  handleDragEnd,
  layout,
  activeId,
  children,
}: DashboardDndProviderProps) {
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={layout} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
      <DragOverlay dropAnimation={null}>
        {activeId ? (
          <div className="pointer-events-none w-full max-w-7xl rounded-2xl border-2 border-primary/60 bg-card/95 shadow-2xl ring-2 ring-primary/20">
            <div className="flex items-center gap-3 border-b border-border/50 px-4 py-2.5">
              <GripVertical className="size-4 shrink-0 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wide text-foreground">
                {SECTION_LABELS[activeId]}
              </span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
