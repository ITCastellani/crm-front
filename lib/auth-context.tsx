"use client"

import { createContext, useContext, useState, useCallback, type ReactNode, useEffect } from "react"
import { loginUser } from "@/actions/auth-actions"
import Cookies from "js-cookie"

interface User {
  email: string
  username: string
}

interface AuthContextType {
  user: User | null // Corregido de 'username' a 'user' para consistencia
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void> // Ahora es una Promesa
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)


  useEffect(() => {
    // Función para validar la sesión al recargar
    const loadUserFromCookies = async () => {
      const token = Cookies.get("token")
      if (token) {
        try {
          // Opcional: Pedir al backend los datos del usuario usando el token
          // const { data } = await api.get("/auth/me")
          // setUser(data)
          setUser({ email: "", username:"" }) // Solución rápida si no tienes /auth/me
          console.log(token)
        } catch (error) {
          Cookies.remove("token")
        }
      }
    }
    loadUserFromCookies()
  }, [])
  


  

  const login = useCallback(async (email: string, password: string) => {
    try {
      const data = await loginUser({ email, password });
      console.log(data)
      // Seteamos el usuario real que viene de la API
      setUser({
        email: data.email,
        username: data.username,
      });

      Cookies.set('token', data.token, { expires: 7, secure: true, sameSite: 'strict' });
      // Si usas tokens, aquí lo guardarías:
      // localStorage.setItem('token', data.token);
      
    } catch (error: any) {
      // Lanzamos el error para que el componente login-form lo capture y muestre
      throw new Error(error.response?.data?.message || "Error al iniciar sesión");
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null);
    // localStorage.removeItem('token');
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}