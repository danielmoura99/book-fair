import Navbar from "@/components/sidebar";
import { OptimizedInventoryTable } from "../_components/optimized-inventory-table";
import { InventoryScannerSection } from "../_components/inventory-scanner-section";
import { InventoryProvider } from "../_components/inventory-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export default function OptimizedInventoryPage() {
  return (
    <>
      <Navbar />
      <div className="text-sm">
        <InventoryProvider>
          <div className="flex flex-col bg-background overflow-auto p-4">
            {/* Cabeçalho */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Inventário Otimizado</h1>
                <p className="text-muted-foreground">
                  Controle de estoque com performance aprimorada
                </p>
              </div>
              
              <Link href="/inventory/logs">
                <Button variant="outline" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Histórico de Logs
                </Button>
              </Link>
            </div>

            {/* Scanner e Atualizações Pendentes */}
            <InventoryScannerSection />

            {/* Tabela de Inventário Otimizada */}
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-4">Inventário Atual</h2>
              <OptimizedInventoryTable />
            </div>
          </div>
        </InventoryProvider>
      </div>
    </>
  );
}