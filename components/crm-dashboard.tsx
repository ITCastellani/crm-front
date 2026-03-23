"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import type { Opportunity, OpportunityStage } from "@/lib/crm-data"
import { getOpportunities, updateOpportunityStatus } from "@/actions/opportunity-actions"
import Loader from "@/components/ui/loader"
import { initialOpportunities, stageConfig } from "@/lib/crm-data"
import { CrmHeader } from "@/components/crm-header"
import { KanbanBoard } from "@/components/kanban-board"
import { OpportunitiesTable } from "@/components/opportunities-table"
import { OpportunityDetail } from "@/components/opportunity-detail"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"

import { DateRange } from "react-day-picker" // Necesitarás instalar react-day-picker si no está
import { addDays, isWithinInterval, startOfDay, endOfDay } from "date-fns"
import { DatePickerWithRange } from "@/components/ui/date-range-picker" // Componente de Shadcn
import { MultiSelect } from "@/components/ui/multi-select" // O un Select simple para tags

import { Kanban, TableIcon, Search, DollarSign, TrendingUp, Target, Users } from "lucide-react"
import { Button } from "./ui/button"

export function CrmDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [opportunities, setOpportunities] = useState([])
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [stageFilter, setStageFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  })
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    opportunities.forEach(opp => opp.tags?.forEach(tag => tags.add(tag)))
    return Array.from(tags)
  }, [opportunities])

  // Lógica de filtrado avanzada
  const filteredOpportunities = opportunities.filter((opp) => {
    // 1. Filtro por búsqueda (texto)
    const matchesSearch =
      searchQuery === "" ||
      opp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.contact?.toLowerCase().includes(searchQuery.toLowerCase())

    // 2. Filtro por Etapa (Select)
    const matchesStage = stageFilter === "all" || opp.status === stageFilter

    // 3. Filtro por Rango de Fechas
    let matchesDate = true
    if (dateRange?.from) {
      const oppDate = new Date(opp.createdAt) // Usamos el timestamp de Mongoose
      const start = startOfDay(dateRange.from)
      const end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from)
      matchesDate = isWithinInterval(oppDate, { start, end })
    }

    // 4. Filtro por Etiquetas (Si la op tiene al menos una de las etiquetas seleccionadas)
    const matchesTags = 
      selectedTags.length === 0 || 
      selectedTags.some(tag => opp.tags?.includes(tag))

    return matchesSearch && matchesStage && matchesDate && matchesTags
  })

         
  const handleMoveOpportunity = useCallback(async (id: string, newStage: OpportunityStage) => {
    // 1. Guardar copia del estado actual por si necesitamos revertir (Rollback)
    const previousOpportunities = [...opportunities];
  
    // 2. Actualización Optimista: Cambiamos el estado local de inmediato
    setOpportunities((prev) =>
      prev.map((opp) =>
        opp._id === id
          ? { ...opp, status: newStage, updatedAt: new Date().toISOString() }
          : opp
      )
    );
  
    try {
      // 3. Llamada a la API vía Axios
      await updateOpportunityStatus(id, newStage);
      // Opcional: una notificación de éxito
      console.log("Estado actualizado en la base de datos");
    } catch (err) {
      // 4. Si falla, hacemos Rollback al estado anterior
      console.error("Fallo la sincronización con la API, revirtiendo...");
      setOpportunities(previousOpportunities);
      
      // Aquí podrías mostrar un toast o alerta al usuario
      alert("No se pudo guardar el cambio en el servidor. Reintentando...");
    }
  }, [opportunities]);
    // Also update selected opportunity if it's the one being moved


  const handleSelectOpportunity = useCallback((opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity)
    //setDetailOpen(true)
    router.push(`/opportunity/${opportunity._id}`)
  }, [])

  const handleCreateOpportunity = useCallback((opportunity: Opportunity) => {
    //setDetailOpen(true)
    router.push(`/CreateOpportunityForm`)
  }, [])



  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getOpportunities();
        console.log(data)
        setOpportunities(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Stats
  const totalValue = filteredOpportunities.reduce((sum, o) => sum + o.totalNet, 0)
  const avgProbability = Math.round(
    filteredOpportunities.reduce((sum, o) => sum + o.probability, 0) / filteredOpportunities.length
  )
  const wonDeals = filteredOpportunities.filter((o) => o.status === "ganado")
  const wonValue = wonDeals.reduce((sum, o) => sum + o.totalNet, 0)
  const activeDeals = filteredOpportunities.filter(
    (o) => o.status !== "ganado" && o.status !== "perdido"
  ).length

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const stats = [
    {
      label: "Total Presupuestado",
      value: formatCurrency(totalValue),
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Prob. Promedio",
      value: `${avgProbability || 0}%`,
      icon: TrendingUp,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      label: "Ganados",
      value: formatCurrency(wonValue),
      icon: Target,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Presupuestos Activos",
      value: activeDeals.toString(),
      icon: Users,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <CrmHeader />

      <main className="flex-1 px-6 py-6">
        <div className="mb-3">
          <Button size="lg" onClick={handleCreateOpportunity}>Crear</Button>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
            >
              <div className={`flex size-10 items-center justify-center rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`size-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-bold text-card-foreground">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters & View Toggle */}
        <Tabs defaultValue="kanban" className="w-full">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            <TabsList>
              <TabsTrigger value="kanban" className="flex items-center gap-1.5">
                <Kanban className="size-4" />
                <span className="hidden sm:inline">Kanban</span>
              </TabsTrigger>
              <TabsTrigger value="table" className="flex items-center gap-1.5">
                <TableIcon className="size-4" />
                <span className="hidden sm:inline">Tabla</span>
              </TabsTrigger>
            </TabsList>

            {/* Búsqueda */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar oportunidades..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filtro de Fecha (Rango) */}
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />

            {/* Filtro de Etiquetas */}
            <Select onValueChange={(value) => setSelectedTags(value === "all" ? [] : [value])}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Etiquetas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las etiquetas</SelectItem>
                {allTags.map(tag => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Botón para limpiar filtros */}
            {(searchQuery || dateRange?.from || stageFilter !== "all" || selectedTags.length > 0) && (
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSearchQuery("")
                  setDateRange(undefined)
                  setStageFilter("all")
                  setSelectedTags([])
                }}
                className="text-xs text-muted-foreground"
              >
                Limpiar filtros
              </Button>
            )}

            <div className="flex items-center gap-3">

              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Todas las etapas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las etapas</SelectItem>
                  {Object.entries(stageConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="kanban">
            <KanbanBoard
              opportunities={filteredOpportunities}
              onMoveOpportunity={handleMoveOpportunity}
              onSelectOpportunity={handleSelectOpportunity}
            />
          </TabsContent>

          <TabsContent value="table">
            <OpportunitiesTable
              opportunities={filteredOpportunities}
              onSelectOpportunity={handleSelectOpportunity}
            />
          </TabsContent>
        </Tabs>
      </main>


    </div>
  )
}
