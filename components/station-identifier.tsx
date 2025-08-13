/* eslint-disable @typescript-eslint/no-unused-vars */
// components/station-identifier.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { Monitor, Edit2, Save, X } from "lucide-react";

export function StationIdentifier() {
  const [stationName, setStationName] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState("");

  useEffect(() => {
    // Carregar nome da estação do localStorage
    const savedName = localStorage.getItem("stationName");
    if (savedName) {
      setStationName(savedName);
    } else {
      // Se não tem nome, forçar configuração inicial
      setIsEditing(true);
      setTempName("Estação 1"); // Nome padrão
    }
  }, []);

  const handleSave = () => {
    if (tempName.trim()) {
      setStationName(tempName.trim());
      localStorage.setItem("stationName", tempName.trim());
      localStorage.setItem("stationConfiguredAt", new Date().toISOString());
      setIsEditing(false);
    }
  };

  const handleEdit = () => {
    setTempName(stationName);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempName(stationName);
    setIsEditing(false);
  };

  const getStationColor = () => {
    // Gerar cor baseada no nome da estação
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-purple-100 text-purple-800",
      "bg-orange-100 text-orange-800",
      "bg-pink-100 text-pink-800",
    ];

    const hash = stationName
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  if (isEditing) {
    return (
      <Card className="border-dashed border-2 border-primary">
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
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
            />
            <Button onClick={handleSave} size="sm">
              <Save className="h-4 w-4" />
            </Button>
            {stationName && (
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Este nome ajuda a identificar qual computador está sendo usado
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">{stationName}</span>
      <Button
        onClick={handleEdit}
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
      >
        <Edit2 className="h-3 w-3" />
      </Button>
    </div>
  );
}
