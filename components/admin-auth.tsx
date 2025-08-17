"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock } from "lucide-react";

// Senha será validada via API para segurança
const AUTH_STORAGE_KEY = "admin_auth_timestamp";
const AUTH_DURATION = 30 * 60 * 1000; // 30 minutos

interface AdminAuthProps {
  children: React.ReactNode;
  pageName: string;
}

export function AdminAuth({ children, pageName }: AdminAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verificar se já está autenticado
    const authTimestamp = localStorage.getItem(AUTH_STORAGE_KEY);
    if (authTimestamp) {
      const now = Date.now();
      const authTime = parseInt(authTimestamp);

      // Se a autenticação ainda é válida (dentro de 30 minutos)
      if (now - authTime < AUTH_DURATION) {
        setIsAuthenticated(true);
      } else {
        // Limpar autenticação expirada
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setValidating(true);
      setError("");
      
      const response = await fetch("/api/auth/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });
      
      const data = await response.json();
      
      if (data.valid) {
        // Salvar timestamp da autenticação
        localStorage.setItem(AUTH_STORAGE_KEY, Date.now().toString());
        setIsAuthenticated(true);
        setError("");
        setPassword("");
      } else {
        setError("Senha incorreta");
        // Voltar para página de vendas após 2 segundos
        setTimeout(() => {
          router.push("/vendas");
        }, 2000);
      }
    } catch (error) {
      console.error("Erro na validação:", error);
      setError("Erro ao validar senha");
    } finally {
      setValidating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
    setPassword("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            Verificando autenticação...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Acesso Restrito</CardTitle>
            <p className="text-sm text-muted-foreground">
              Digite a senha de administrador para acessar {pageName}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Senha de administrador"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-center"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={validating}>
                  {validating ? "Validando..." : `Acessar ${pageName}`}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/vendas")}
                  disabled={validating}
                >
                  Voltar para Vendas
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Botão de logout no canto superior direito */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="bg-background"
        >
          <Lock className="h-4 w-4 mr-2" />
          Sair Admin
        </Button>
      </div>
      {children}
    </div>
  );
}
