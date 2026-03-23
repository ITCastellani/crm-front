"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { getOpportunities } from "@/actions/opportunity-actions"
import Loader from "@/components/ui/loader"
import type { Opportunity, OpportunityStage } from "@/lib/crm-data"
import { stageConfig, stageOrder } from "@/lib/crm-data"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Building2, DollarSign, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"



interface KanbanBoardProps {
  opportunities: Opportunity[]
  onMoveOpportunity: (id: string, newStage: OpportunityStage) => void
  onSelectOpportunity: (opportunity: Opportunity) => void
}

export function KanbanBoard({opportunities, onMoveOpportunity, onSelectOpportunity }: KanbanBoardProps) {

  
 
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverStage, setDragOverStage] = useState<OpportunityStage | null>(null)
  const dragCounter = useRef<Record<string, number>>({})

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", id)
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5"
    }
  }, [])

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    setDraggedId(null)
    setDragOverStage(null)
    dragCounter.current = {}
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1"
    }
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent, stage: OpportunityStage) => {
    e.preventDefault()
    if (!dragCounter.current[stage]) dragCounter.current[stage] = 0
    dragCounter.current[stage]++
    setDragOverStage(stage)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent, stage: OpportunityStage) => {
    e.preventDefault()
    dragCounter.current[stage]--
    if (dragCounter.current[stage] <= 0) {
      dragCounter.current[stage] = 0
      setDragOverStage((prev) => (prev === stage ? null : prev))
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, stage: OpportunityStage) => {
      e.preventDefault()
      const id = e.dataTransfer.getData("text/plain")
      if (id && draggedId) {
        onMoveOpportunity(id, stage)
      }
      setDraggedId(null)
      setDragOverStage(null)
      dragCounter.current = {}
    },
    [draggedId, onMoveOpportunity]
  )

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-4 px-1 min-w-max">
        {stageOrder.map((stage) => {
          const config = stageConfig[stage]
          const stageOpps = opportunities.filter((o) => o.status === stage)
          const total = stageOpps.reduce((sum, o) => sum + o.totalNet, 0)

          return (
            <div
              key={stage}
              className={cn(
                "flex w-72 flex-shrink-0 flex-col rounded-xl bg-muted/50 transition-colors",
                dragOverStage === stage && "bg-primary/5 ring-2 ring-primary/20"
              )}
              onDragEnter={(e) => handleDragEnter(e, stage)}
              onDragLeave={(e) => handleDragLeave(e, stage)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex size-2.5 rounded-full",
                      config.color.replace("text-", "bg-")
                    )}
                  />
                  <h3 className="text-sm font-semibold text-foreground">{config.label}</h3>
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {stageOpps.length}
                  </Badge>
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {formatCurrency(total)}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2 px-3 pb-3 min-h-32">
                {stageOpps.map((opp) => (
                  <div
                    key={opp._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, opp._id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onSelectOpportunity(opp)}
                    className={cn(
                      "group cursor-grab rounded-lg border border-border bg-card p-3 shadow-sm transition-all hover:shadow-md hover:border-primary/20 active:cursor-grabbing",
                      draggedId === opp._id && "opacity-50"
                    )}
                    role="button"
                    tabIndex={0}
                    aria-label={`Oportunidad: ${opp.contact}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        onSelectOpportunity(opp)
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-card-foreground truncate">
                          {opp.contact}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                          <Building2 className="size-3 flex-shrink-0" />
                          <span className="text-xs truncate">{opp.company}</span>
                        </div>
                      </div>
                      <GripVertical className="size-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-primary">
                        <DollarSign className="size-3.5" />
                        <span className="text-sm font-semibold">{formatCurrency(opp.totalNet)}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {opp.probability}%
                      </span>
                    </div>
                  </div>
                ))}

                {stageOpps.length === 0 && (
                  <div className="flex items-center justify-center rounded-lg border border-dashed border-border/60 py-8 text-xs text-muted-foreground">
                    Sin oportunidades
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
