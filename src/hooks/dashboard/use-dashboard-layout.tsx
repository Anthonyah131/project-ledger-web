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
import { GripVertical, LayoutGrid, Wallet, PieChart, TrendingUp } from "lucide-react"
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

function EditModeSkeleton({ id }: { id: DashboardSectionId }) {
  const skeletons: Record<DashboardSectionId, React.ReactNode> = {
    "summary-cards": (
      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="size-5 rounded-md bg-muted-foreground/10" />
          <div className="h-4 w-16 rounded bg-muted-foreground/10" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-5 rounded-md bg-muted-foreground/10" />
          <div className="h-4 w-12 rounded bg-muted-foreground/10" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-5 rounded-md bg-muted-foreground/10" />
          <div className="h-4 w-14 rounded bg-muted-foreground/10" />
        </div>
      </div>
    ),
    "budget-widget": (
      <div className="ml-auto flex items-center gap-3">
        <div className="h-4 w-20 rounded-full bg-muted-foreground/10" />
        <div className="size-8 rounded-full bg-muted-foreground/10 ring-4 ring-muted-foreground/5" />
      </div>
    ),
    "payment-top-row": (
      <div className="ml-auto flex items-center gap-3">
        <div className="size-8 rounded-full bg-muted-foreground/10" />
        <div className="size-8 rounded-full bg-muted-foreground/10" />
      </div>
    ),
    "trend-chart": (
      <div className="ml-auto flex items-center gap-2">
        <svg className="h-6 w-16 text-muted-foreground/10" viewBox="0 0 64 24" fill="none">
          <polyline
            points="0,18 12,8 24,14 36,6 48,12 64,4"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
    ),
  }
  return skeletons[id]
}

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
  const [isEditMode, setIsEditMode] = useState(false)

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

  const toggleEditMode = useCallback(() => {
    setIsEditMode((prev) => !prev)
  }, [])

  const saveLayout = useCallback(() => {
    setIsEditMode(false)
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
    isEditMode,
    toggleEditMode,
    saveLayout,
  }
}

interface SortableSectionProps {
  id: DashboardSectionId
  isMobile?: boolean
  isEditMode?: boolean
  children: React.ReactNode
}

export function SortableSection({ id, isMobile, isEditMode, children }: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: isMobile || !isEditMode })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  if (isMobile) {
    return <section className="contents">{children}</section>
  }

  if (isEditMode) {
    return (
      <section
        ref={setNodeRef}
        style={style}
        className={cn(
          "group relative flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-border/80 bg-muted/30 px-4 py-3 transition-all duration-200",
          isDragging ? "border-primary/50 bg-primary/5 opacity-80" : "hover:border-primary/40 hover:bg-muted/50"
        )}
        {...attributes}
        {...listeners}
      >
        <GripVertical className={cn("size-4 shrink-0 text-muted-foreground", isDragging && "text-primary")} />
        {SECTION_ICONS[id]}
        <span className="text-sm font-medium text-foreground">
          {SECTION_LABELS[id]}
        </span>
        <EditModeSkeleton id={id} />
      </section>
    )
  }

  return (
    <section
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative transition-all duration-300",
        isDragging
          ? "opacity-50"
          : ""
      )}
      {...attributes}
    >
      {children}
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

const SECTION_ICONS: Record<DashboardSectionId, React.ReactNode> = {
  "summary-cards": <LayoutGrid className="size-4 shrink-0 text-muted-foreground" />,
  "budget-widget": <Wallet className="size-4 shrink-0 text-muted-foreground" />,
  "payment-top-row": <PieChart className="size-4 shrink-0 text-muted-foreground" />,
  "trend-chart": <TrendingUp className="size-4 shrink-0 text-muted-foreground" />,
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
              {SECTION_ICONS[activeId]}
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
