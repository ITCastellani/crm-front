"use client"

import { useState } from "react"
import { useRouter } from "next/navigation" // Importante: de next/navigation
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Eye, EyeOff } from "lucide-react"

import { loginUser } from '@/actions/auth-actions';
import  Loader from '@/components/ui/loader'
import { useUserStore } from '@/hooks/use-user-store';
import Cookies from 'js-cookie';

export function LoginForm() {
  const setUserName = useUserStore((state) => state.setUserName);
  // Dentro de LoginForm
  const router = useRouter()
  const { login } = useAuth();
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("")
    setIsLoading(true)

    try {
      const data = await loginUser({ email, password });

      Cookies.set('token', data.token, { expires: 7 })

      // Guardamos el nombre en el estado global
      
      if (!data) {
        setError("Credenciales invalidas. Intente nuevamente.")
        setIsLoading(false);
        return;
      }
      await login(email, password);
      setIsLoading(false)
      
      setUserName(data.username); 
      alert(`Bienvenido, ${data.username}`);
      // Redirigir al dashboard...
      router.push("/dashboard")
    } catch (err:any) {
      setIsLoading(false);
      setError(err.message || "Error al conectar con el servidor");
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-xl bg-primary">
            <BarChart3 className="size-7 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">CRM Pipeline</h1>
            <p className="mt-1 text-sm text-muted-foreground">Gestiona tus oportunidades de venta</p>
          </div>
        </div>

        <Card className="border-border/60 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-card-foreground">Iniciar Sesion</CardTitle>
            <CardDescription>Ingresa tus credenciales para acceder al panel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-foreground">Correo electronico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="text-foreground">Contrasena</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu contrasena"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full mt-2" disabled={isLoading}>
              {isLoading ? (
                  <div className="scale-[0.3]"> {/* Ajustamos el tamaño para que quepa en el botón */}
                    <Loader />
                  </div>
                ) : (
                  "Iniciar Sesión"
                )
              }
              </Button>

              <p className="text-center text-xs text-muted-foreground mt-2">
                Demo: usa cualquier email y contrasena
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
