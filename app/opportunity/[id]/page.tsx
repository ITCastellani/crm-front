"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getOpportunities } from "@/actions/opportunity-actions"
import { OpportunityDetailView } from "@/components/opportunity-detail-view"
import Loader from "@/components/ui/loader"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default function OpportunityPage() {
  const params = useParams()
  const router = useRouter()
  const [opportunity, setOpportunity] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOpp = async () => {
      try {
        const all = await getOpportunities()
        // Buscamos la oportunidad específica por ID
        const found = all.find((o: any) => o._id === params.id)
        setOpportunity(found)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchOpp()
  }, [params.id])

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader /></div>
  if (!opportunity) return <div className="p-10 text-center">Oportunidad no encontrada</div>

  return (
    <div className="container mx-auto p-6">
      <Button 
        variant="ghost" 
        onClick={() => router.back()} 
        className="mb-4 gap-2"
      >
        <ChevronLeft className="size-4" /> Volver al Dashboard
      </Button>
      <OpportunityDetailView opportunity={opportunity} />
    </div>
  )
}