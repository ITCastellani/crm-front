"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import api from "@/lib/axios"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Trash2, Plus, Calculator } from "lucide-react"
import { QuoteForm } from "@/components/ui/quote-form"

// Esquema de validación basado en tu modelo de Mongoose
const formSchema = z.object({
  name: z.string().min(3, "El nombre de la oportunidad es requerido"),
  contact: z.string().min(2, "El nombre de contacto es requerido"),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  origin: z.string().optional(),
  probability: z.coerce.number().min(0).max(100),
  status: z.string().default("nuevo"),
  shippingAddress: z.string().optional(),
  paymentMethod: z.string().optional(),
  discountPercentage: z.coerce.number().default(0),
  items: z.array(z.object({
    description: z.string().min(1, "Requerido"),
    details: z.string().optional(),
    price: z.coerce.number().min(0),
    quantity: z.coerce.number().min(1)
  })).min(1, "Agrega al menos un ítem")
})

export default function CreateOpportunityForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  // --- ESTADOS DEL FORMULARIO ACTUAL ---
  

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      probability: 50,
      status: "nuevo",
      discountPercentage: 0,
      items: [{ description: "", details: "", price: 0, quantity: 1 }]
    }
  })

  const { fields, append, remove } = useFieldArray({ control, name: "items" })
  
  // Observar items y descuento para calcular totales en tiempo real
  const watchedItems = watch("items")
  const watchedDiscount = watch("discountPercentage")

  const bruteTotal = watchedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)
  const discountAmount = (bruteTotal * (watchedDiscount / 100))
  const netTotal = bruteTotal - discountAmount

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)
    try {
      // Preparamos el objeto final con los cálculos que espera el backend
      const payload = {
        ...values,
        totalBrute: bruteTotal,
        discountAmount: discountAmount,
        totalNet: netTotal
      }
      
      await api.post("/opportunities", payload)
      toast.success("Oportunidad creada con éxito")
      router.push("/dashboard")
      router.refresh()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al crear")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-5xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Nueva Oportunidad</h1>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" disabled={loading}>{loading ? "Guardando..." : "Crear Oportunidad"}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* SECCIÓN IZQUIERDA: Info General y Contacto */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Información General</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Nombre de la Oportunidad (Proyecto)</Label>
                <Input {...register("name")} placeholder="Ej: Red de Fibra Edificio X" />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Contacto Principal</Label>
                <Input {...register("contact")} placeholder="Nombre del cliente" />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input {...register("contactPhone")} placeholder="+54..." />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Email</Label>
                <Input {...register("contactEmail")} placeholder="correo@ejemplo.com" />
              </div>
            </CardContent>
          </Card>
          <QuoteForm />
          {/* SECCIÓN DERECHA: FORM PRECIOS */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Ítems del Presupuesto</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => append({ description: "", details: "", price: 0, quantity: 1 })}>
                <Plus className="mr-2 size-4" /> Agregar Ítem
              </Button>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="group relative border p-4 rounded-lg bg-muted/30 space-y-3">
                  <Button 
                    type="button" variant="ghost" size="icon" 
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-destructive"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>

                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-6 space-y-1">
                      <Label className="text-xs">Descripción</Label>
                      <Input {...register(`items.${index}.description`)} placeholder="Producto/Servicio" />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Cant.</Label>
                      <Input type="number" {...register(`items.${index}.quantity`)} />
                    </div>
                    <div className="col-span-4 space-y-1">
                      <Label className="text-xs">Precio Unit.</Label>
                      <Input type="number" {...register(`items.${index}.price`)} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* SECCIÓN DERECHA: Totales y Metadatos */}
        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Calculator className="size-4" /> Resumen</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal Bruto:</span>
                <span className="font-medium">${bruteTotal.toLocaleString()}</span>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Descuento (%)</Label>
                <Input type="number" {...register("discountPercentage")} />
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total Neto:</span>
                <span className="text-primary">${netTotal.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Logística y Estado</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Probabilidad (%)</Label>
                <Input type="number" {...register("probability")} />
              </div>
              <div className="space-y-2">
                <Label>Método de Pago</Label>
                <Input {...register("paymentMethod")} placeholder="Transferencia, Efectivo..." />
              </div>
              <div className="space-y-2">
                <Label>Dirección de Envío</Label>
                <Input {...register("shippingAddress")} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}