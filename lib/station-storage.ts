// lib/station-storage.ts
"use client";

/**
 * Sistema de localStorage específico por estação
 * Resolve conflitos entre múltiplas estações usando o mesmo sistema
 */

// Cache do nome da estação para evitar múltiplas leituras
let stationNameCache: string | null = null;

/**
 * Obtém o nome da estação atual
 */
function getStationName(): string {
  if (typeof window === "undefined") return "default";
  
  // Usar cache se disponível
  if (stationNameCache) return stationNameCache;
  
  // Tentar obter do localStorage
  const savedName = localStorage.getItem("stationName");
  if (savedName) {
    stationNameCache = savedName;
    return savedName;
  }
  
  // Fallback para estação padrão
  const defaultName = "Estacao1";
  stationNameCache = defaultName;
  return defaultName;
}

/**
 * Gera chave única baseada na estação
 */
function getStationKey(baseKey: string): string {
  const stationName = getStationName();
  // Sanitizar nome da estação (remover espaços e caracteres especiais)
  const sanitizedStation = stationName.replace(/[^a-zA-Z0-9]/g, "_");
  return `${baseKey}_${sanitizedStation}`;
}

/**
 * Obtém item do localStorage específico da estação
 */
export function getStationItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  
  const stationKey = getStationKey(key);
  const value = localStorage.getItem(stationKey);
  
  // Se não encontrar com chave da estação, tentar migrar da chave antiga
  if (!value) {
    const oldValue = localStorage.getItem(key);
    if (oldValue) {
      // Migrar para nova chave
      localStorage.setItem(stationKey, oldValue);
      // Manter chave antiga por compatibilidade (não remover ainda)
      console.log(`Migrated ${key} to ${stationKey}`);
      return oldValue;
    }
  }
  
  return value;
}

/**
 * Define item no localStorage específico da estação
 */
export function setStationItem(key: string, value: string): void {
  if (typeof window === "undefined") return;
  
  const stationKey = getStationKey(key);
  localStorage.setItem(stationKey, value);
}

/**
 * Remove item do localStorage específico da estação
 */
export function removeStationItem(key: string): void {
  if (typeof window === "undefined") return;
  
  const stationKey = getStationKey(key);
  localStorage.removeItem(stationKey);
}

/**
 * Limpa cache do nome da estação (usar quando estação for renomeada)
 */
export function clearStationNameCache(): void {
  stationNameCache = null;
}

/**
 * Debug: Lista todas as chaves relacionadas à estação atual
 */
export function debugStationStorage(): void {
  if (typeof window === "undefined") return;
  
  const stationName = getStationName();
  const sanitizedStation = stationName.replace(/[^a-zA-Z0-9]/g, "_");
  
  console.log(`🏢 Estação: ${stationName}`);
  console.log(`🔑 Sufixo: ${sanitizedStation}`);
  
  const stationKeys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.endsWith(`_${sanitizedStation}`)) {
      stationKeys.push(key);
    }
  }
  
  console.log(`📦 Chaves da estação:`, stationKeys);
}