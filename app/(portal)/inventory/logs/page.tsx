// app/(portal)/inventory/logs/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { prisma } from "@/lib/prisma";
import Navbar from "@/components/sidebar";
import { InventoryLogsTable } from "./_components/inventory-logs-table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

async function getInventoryLogs() {
  const logs = await prisma.inventoryLog.findMany({
    orderBy: {
      timestamp: "desc",
    },
    take: 500, // Limitar para os 500 registros mais recentes para melhor performance
  });

  return logs;
}

export default async function InventoryLogsPage() {
  const logs = await getInventoryLogs();

  return (
    <>
      <Navbar />
      <div className="flex flex-col h-screen bg-background overflow-hidden">
        <div className="p-8">
          {/* Cabeçalho com título e botão de voltar */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">
              Histórico de Atividades do Inventário
            </h1>
            <Link href="/inventory">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar ao Inventário
              </Button>
            </Link>
          </div>

          <InventoryLogsTable logs={logs} />
        </div>
      </div>
    </>
  );
}
