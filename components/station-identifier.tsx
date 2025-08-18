/* eslint-disable @typescript-eslint/no-unused-vars */
// components/station-identifier.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { Monitor, Edit2, Save, X, Settings } from "lucide-react";
import { clearStationNameCache } from "@/lib/station-storage";

export function StationIdentifier() {
  const [stationName, setStationName] = useState<string>("");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Carregar nome da estação do localStorage
    const savedName = localStorage.getItem("stationName");
    if (savedName) {
      setStationName(savedName);
    } else {
      // Se não tem nome, definir um padrão
      setStationName("Estação 1");
      localStorage.setItem("stationName", "Estação 1");
    }
  }, []);

  // ✅ NOVA FUNCIONALIDADE: Mostrar editor apenas na página de configurações
  const isOnSettingsPage = pathname === "/settings/printer";

  const handleEdit = () => {
    // Se já está na página de configurações, permitir edição inline
    if (isOnSettingsPage) {
      setIsEditing(true);
      return;
    }
    
    // Se não está na página de configurações, redirecionar
    router.push("/settings/printer");
  };

  // ✅ EDITOR INLINE apenas para página de configurações
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState("");

  const handleSave = () => {
    if (tempName.trim()) {
      setStationName(tempName.trim());
      localStorage.setItem("stationName", tempName.trim());
      localStorage.setItem("stationConfiguredAt", new Date().toISOString());
      clearStationNameCache();
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTempName(stationName);
    setIsEditing(false);
  };

  // Se está editando na página de configurações
  if (isOnSettingsPage && isEditing) {
    return (
      <Card className="border-dashed border-2 border-primary w-80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Configurar Estação
          </CardTitle>
          <CardDescription>
            Dê um nome para identificar esta estação de trabalho
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ex: Estação 1, Caixa Principal, etc."
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
                if (e.key === "Escape") {
                  handleCancel();
                }
              }}
              autoFocus
            />
            <Button onClick={handleSave} size="sm">
              <Save className="h-4 w-4" />
            </Button>
            <Button onClick={handleCancel} variant="outline" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Este nome ajuda a identificar qual computador está sendo usado
          </p>
        </CardContent>
      </Card>
    );
  }

  // Visualização normal
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">{stationName}</span>
      <Button
        onClick={() => {
          if (isOnSettingsPage) {
            setTempName(stationName);
            setIsEditing(true);
          } else {
            handleEdit();
          }
        }}
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
      >
        {isOnSettingsPage ? <Edit2 className="h-3 w-3" /> : <Settings className="h-3 w-3" />}
      </Button>
    </div>
  );
}
