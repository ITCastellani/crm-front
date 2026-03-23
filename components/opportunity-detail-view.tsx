"use client"

import { Opportunity } from "@/types/opportunity" // Asegúrate de tener la interface
import { stageConfig } from "@/lib/crm-data"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  Mail, Phone, User, MapPin, CreditCard, 
  Tag, Calendar, Percent, Hash, Globe 
} from "lucide-react"
import type { Opportunity, OpportunityStage } from "@/lib/crm-data"
import { cn } from "@/lib/utils"

interface OpportunityDetailViewProps {
  opportunity: Opportunity // O usa tu interface Opportunity
}

export function OpportunityDetailView({ opportunity }: OpportunityDetailViewProps) {

  const config = stageConfig[opportunity.status] || { label: opportunity.status, bgColor: "bg-muted", color: "text-muted-foreground" };
    console.log(opportunity)
    console.log(config)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      
      {/* COLUMNA PRINCIPAL (Items y Totales) */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">{opportunity.name}</CardTitle>
              <p className="text-muted-foreground text-sm">ID: {opportunity._id}</p>
            </div>
            <Badge className={cn("px-3 py-1 text-sm", config.bgColor, config.color)}>
              {config.label}
            </Badge>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Hash className="size-4" /> Ítems del Presupuesto
            </h3>
            <div className="rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="p-3 text-left">Descripción</th>
                    <th className="p-3 text-center">Cant.</th>
                    <th className="p-3 text-right">Precio</th>
                    <th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {opportunity.items?.map((item: any, index: number) => (
                    <tr key={index}>
                      <td className="p-3">
                        <p className="font-medium">{item.description}</p>
                        <p className="text-xs text-muted-foreground">{item.details}</p>
                      </td>
                      <td className="p-3 text-center">{item.quantity}</td>
                      <td className="p-3 text-right">{formatCurrency(item.price)}</td>
                      <td className="p-3 text-right font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Resumen de Totales */}
            <div className="mt-6 space-y-2 ml-auto max-w-xs text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal Bruto:</span>
                <span>{formatCurrency(opportunity.totalBrute)}</span>
              </div>
              <div className="flex justify-between text-success">
                <span className="flex items-center gap-1">
                  <Percent className="size-3" /> Descuento ({opportunity.discountPercentage}%):
                </span>
                <span>-{formatCurrency(opportunity.discountAmount)}</span>
              </div>

              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total Neto:</span>
                <span className="text-primary">{formatCurrency(opportunity.totalNet * 1.21)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detalles Adicionales */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MapPin className="size-4" /> Entrega y Pago
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Dirección de Envío</p>
                <p className="text-sm">{opportunity.shippingAddress || "No especificada"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Método de Pago</p>
                <p className="text-sm flex items-center gap-2">
                  <CreditCard className="size-3" /> {opportunity.paymentMethod || "No definido"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SIDEBAR (Contacto y Meta-data) */}
      <div className="space-y-6">
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Información del Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="size-4 text-primary" />
              <div>
                <p className="text-sm font-medium">{opportunity.contact}</p>
                <p className="text-xs text-muted-foreground">Nombre del Contacto</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="size-4 text-primary" />
              <div>
                <p className="text-sm">{opportunity.contactEmail}</p>
                <p className="text-xs text-muted-foreground">Email</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="size-4 text-primary" />
              <div>
                <p className="text-sm">{opportunity.contactPhone}</p>
                <p className="text-xs text-muted-foreground">Teléfono</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Métricas de Venta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Probabilidad de cierre</span>
                <span className="font-bold">{opportunity.probability}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all" 
                  style={{ width: `${opportunity.probability}%` }}
                />
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Globe className="size-3" /> Origen: {opportunity.origin}
              </p>
              <div className="flex flex-wrap gap-2">
                {opportunity.tags?.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-[10px] uppercase flex items-center gap-1">
                    <Tag className="size-2" /> {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}