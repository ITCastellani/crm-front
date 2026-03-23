"use client"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { CrmDashboard } from "@/components/crm-dashboard"
import Loader from "@/components/ui/loader"

export default function DashboardPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
    } else {
      setChecking(false)
    }
  }, [isAuthenticated, router])

  if (checking || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    )
  }

  return <CrmDashboard />
}