"use client"

import type { Opportunity } from "@/lib/crm-data"
import { stageConfig } from "@/lib/crm-data"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface OpportunitiesTableProps {
  opportunities: Opportunity[]
  onSelectOpportunity: (opportunity: Opportunity) => void
}

export function OpportunitiesTable({ opportunities, onSelectOpportunity }: OpportunitiesTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-card-foreground">Oportunidad</TableHead>
            <TableHead className="text-card-foreground">Empresa</TableHead>
            <TableHead className="text-card-foreground">Contacto</TableHead>
            <TableHead className="text-card-foreground">Valor</TableHead>
            <TableHead className="text-card-foreground">Etapa</TableHead>
            <TableHead className="text-card-foreground">Probabilidad</TableHead>
            <TableHead className="text-card-foreground">Origen</TableHead>
            <TableHead className="text-card-foreground">Actualizado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {opportunities.map((opp) => {
            const config = stageConfig[opp.status] || { 
              label: opp.status, 
              bgColor: "bg-gray-100", 
              color: "text-gray-600" 
            };
            return (
              <TableRow
                key={opp._id}
                className="cursor-pointer transition-colors"
                onClick={() => onSelectOpportunity(opp)}
                role="button"
                tabIndex={0}
                aria-label={`Ver detalles de ${opp.name}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onSelectOpportunity(opp)
                  }
                }}
              >
                <TableCell className="font-medium text-card-foreground">{opp.name}</TableCell>
                <TableCell className="text-muted-foreground">{opp.company}</TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm text-card-foreground">{opp.contact}</p>
                    <p className="text-xs text-muted-foreground">{opp.contactEmail}</p>
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-card-foreground">{formatCurrency(opp.totalNet)}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn("text-xs", config.bgColor, config.color)}
                  >
                    {config.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          opp.probability >= 75
                            ? "bg-success"
                            : opp.probability >= 50
                              ? "bg-warning"
                              : opp.probability >= 25
                                ? "bg-chart-1"
                                : "bg-muted-foreground"
                        )}
                        style={{ width: `${opp.probability}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{opp.probability}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    {opp.origin}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(opp.updatedAt)}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
