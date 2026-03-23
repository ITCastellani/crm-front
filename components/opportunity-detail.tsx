"use client"

import type { Opportunity, OpportunityStage } from "@/lib/crm-data"
import { stageConfig, stageOrder } from "@/lib/crm-data"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Building2,
  Calendar,
  DollarSign,
  Mail,
  Phone,
  User,
  TrendingUp,
  FileText,
  Globe,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface OpportunityDetailProps {
  opportunity: Opportunity | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStageChange: (id: string, stage: OpportunityStage) => void
}

export function OpportunityDetail({
  opportunity,
  open,
  onOpenChange,
  onStageChange,
}: OpportunityDetailProps) {
  if (!opportunity) return null

  const config = stageConfig[opportunity.stage]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-2">
          <div className="flex items-start justify-between gap-4 pr-8">
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-xl text-foreground">{opportunity.name}</SheetTitle>
              <SheetDescription className="mt-1 flex items-center gap-1.5">
                <Building2 className="size-3.5" />
                {opportunity.company}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4 pb-6">
          {/* Value & Stage */}
          <div className="flex flex-col gap-4 rounded-xl bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="size-5 text-primary" />
                <span className="text-2xl font-bold text-foreground">{formatCurrency(opportunity.value)}</span>
              </div>
              <Badge
                variant="secondary"
                className={cn("text-sm px-3 py-1", config.bgColor, config.color)}
              >
                {config.label}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <TrendingUp className="size-4 text-muted-foreground flex-shrink-0" />
              <div className="flex flex-1 items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-background">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      opportunity.probability >= 75
                        ? "bg-success"
                        : opportunity.probability >= 50
                          ? "bg-warning"
                          : opportunity.probability >= 25
                            ? "bg-chart-1"
                            : "bg-muted-foreground"
                    )}
                    style={{ width: `${opportunity.probability}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-foreground min-w-12 text-right">
                  {opportunity.probability}%
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Cambiar etapa</label>
              <Select
                value={opportunity.stage}
                onValueChange={(value) => onStageChange(opportunity.id, value as OpportunityStage)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stageOrder.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex size-2 rounded-full",
                            stageConfig[stage].color.replace("text-", "bg-")
                          )}
                        />
                        {stageConfig[stage].label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">Informacion de Contacto</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                  <User className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{opportunity.contact}</p>
                  <p className="text-xs text-muted-foreground">Contacto principal</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                  <Mail className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <a
                    href={`mailto:${opportunity.email}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {opportunity.email}
                  </a>
                  <p className="text-xs text-muted-foreground">Email</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                  <Phone className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{opportunity.phone}</p>
                  <p className="text-xs text-muted-foreground">Telefono</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Details */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">Detalles</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                <Globe className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Origen</p>
                  <p className="text-sm font-medium text-foreground">{opportunity.source}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                <Calendar className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Creado</p>
                  <p className="text-sm font-medium text-foreground">{formatDate(opportunity.createdAt)}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
              <Calendar className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Ultima actualizacion</p>
                <p className="text-sm font-medium text-foreground">{formatDate(opportunity.updatedAt)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Notes */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Notas</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground rounded-lg bg-muted/50 p-3">
              {opportunity.notes}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
