export type OpportunityStage =
  | "nuevo"
  | "contactado"
  | "propuesta"
  | "negociacion"
  | "ganado"
  | "perdido"

export interface Opportunity {
  _id: string
  name: string
  company: string
  contact: string
  email: string
  phone: string
  value: number
  stage: OpportunityStage
  probability: number
  createdAt: string
  updatedAt: string
  notes: string
  source: string
}

export const stageConfig: Record<
  OpportunityStage,
  { label: string; color: string; bgColor: string }
> = {
  nuevo: {
    label: "Nuevo",
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
  },
  contactado: {
    label: "Contactado",
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
  },
  propuesta: {
    label: "Propuesta",
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
  },
  negociacion: {
    label: "Negociacion",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  ganado: {
    label: "Ganado",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  perdido: {
    label: "Perdido",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
}

export const stageOrder: OpportunityStage[] = [
  "nuevo",
  "contactado",
  "propuesta",
  "negociacion",
  "ganado",
  "perdido",
]

export const initialOpportunities: Opportunity[] = [
  {
    _id: "opp-001",
    name: "Implementacion ERP",
    company: "Tech Solutions SA",
    contact: "Carlos Martinez",
    email: "carlos@techsolutions.com",
    phone: "+54 11 4555-1234",
    value: 45000,
    stage: "nuevo",
    probability: 20,
    createdAt: "2026-02-15",
    updatedAt: "2026-03-01",
    notes: "Empresa interesada en migrar su sistema legacy a un ERP moderno. Reunion inicial agendada.",
    source: "Referido",
  },
  {
    _id: "opp-002",
    name: "Rediseno Web Corporativo",
    company: "Marketing Global",
    contact: "Ana Rodriguez",
    email: "ana@marketingglobal.com",
    phone: "+54 11 4555-5678",
    value: 12000,
    stage: "contactado",
    probability: 40,
    createdAt: "2026-02-10",
    updatedAt: "2026-02-28",
    notes: "Necesitan un rediseno completo de su sitio web. Ya se envio brief inicial.",
    source: "Web",
  },
  {
    _id: "opp-003",
    name: "App Movil E-commerce",
    company: "Retail Plus",
    contact: "Diego Fernandez",
    email: "diego@retailplus.com",
    phone: "+54 11 4555-9012",
    value: 68000,
    stage: "propuesta",
    probability: 60,
    createdAt: "2026-01-20",
    updatedAt: "2026-02-25",
    notes: "Propuesta enviada para desarrollo de app iOS y Android. Esperando respuesta del directorio.",
    source: "LinkedIn",
  },
  {
    _id: "opp-004",
    name: "Migracion Cloud AWS",
    company: "Finanzas Corp",
    contact: "Laura Gomez",
    email: "laura@finanzascorp.com",
    phone: "+54 11 4555-3456",
    value: 95000,
    stage: "negociacion",
    probability: 75,
    createdAt: "2026-01-05",
    updatedAt: "2026-03-02",
    notes: "Negociando terminos del contrato. El cliente solicito descuento por volumen.",
    source: "Evento",
  },
  {
    _id: "opp-005",
    name: "Sistema de Inventario",
    company: "Logistica Express",
    contact: "Roberto Sanchez",
    email: "roberto@logisticaexpress.com",
    phone: "+54 11 4555-7890",
    value: 32000,
    stage: "ganado",
    probability: 100,
    createdAt: "2025-12-15",
    updatedAt: "2026-02-20",
    notes: "Contrato firmado. Inicio de desarrollo programado para marzo.",
    source: "Referido",
  },
  {
    _id: "opp-006",
    name: "Plataforma de Capacitacion",
    company: "EduTech",
    contact: "Maria Lopez",
    email: "maria@edutech.com",
    phone: "+54 11 4555-2345",
    value: 28000,
    stage: "perdido",
    probability: 0,
    createdAt: "2026-01-10",
    updatedAt: "2026-02-15",
    notes: "El cliente decidio trabajar con otro proveedor por temas de presupuesto.",
    source: "Web",
  },
  {
    _id: "opp-007",
    name: "CRM Personalizado",
    company: "Ventas Pro",
    contact: "Federico Torres",
    email: "federico@ventaspro.com",
    phone: "+54 11 4555-6789",
    value: 55000,
    stage: "nuevo",
    probability: 15,
    createdAt: "2026-03-01",
    updatedAt: "2026-03-03",
    notes: "Contacto inicial. Interesados en un CRM a medida con integraciones.",
    source: "LinkedIn",
  },
  {
    _id: "opp-008",
    name: "Automatizacion de Procesos",
    company: "Industrias del Sur",
    contact: "Patricia Mendez",
    email: "patricia@industriasdelsur.com",
    phone: "+54 11 4555-0123",
    value: 78000,
    stage: "contactado",
    probability: 35,
    createdAt: "2026-02-20",
    updatedAt: "2026-03-02",
    notes: "Segunda llamada realizada. Interesados en automatizar sus procesos de produccion.",
    source: "Evento",
  },
  {
    _id: "opp-009",
    name: "Dashboard Analitico",
    company: "Data Insights",
    contact: "Jorge Ruiz",
    email: "jorge@datainsights.com",
    phone: "+54 11 4555-4567",
    value: 22000,
    stage: "propuesta",
    probability: 55,
    createdAt: "2026-02-05",
    updatedAt: "2026-02-28",
    notes: "Propuesta de dashboard con visualizaciones en tiempo real. Demo agendada.",
    source: "Web",
  },
  {
    _id: "opp-010",
    name: "Integracion API Bancaria",
    company: "Neo Banking",
    contact: "Valeria Castro",
    email: "valeria@neobanking.com",
    phone: "+54 11 4555-8901",
    value: 120000,
    stage: "negociacion",
    probability: 80,
    createdAt: "2025-12-20",
    updatedAt: "2026-03-03",
    notes: "Negociacion avanzada. Definiendo SLAs y penalidades del contrato.",
    source: "Referido",
  },
  {
    _id: "opp-011",
    name: "Portal de Clientes",
    company: "Seguros Integral",
    contact: "Marcos Diaz",
    email: "marcos@segurosintegral.com",
    phone: "+54 11 4555-2340",
    value: 41000,
    stage: "ganado",
    probability: 100,
    createdAt: "2025-11-30",
    updatedAt: "2026-01-15",
    notes: "Proyecto completado exitosamente. Cliente satisfecho.",
    source: "Referido",
  },
  {
    _id: "opp-012",
    name: "Sistema de Turnos Online",
    company: "Salud Digital",
    contact: "Elena Vargas",
    email: "elena@saluddigital.com",
    phone: "+54 11 4555-5670",
    value: 18000,
    stage: "perdido",
    probability: 0,
    createdAt: "2026-01-25",
    updatedAt: "2026-02-10",
    notes: "Proyecto cancelado por cambio de prioridades del cliente.",
    source: "LinkedIn",
  },
]
