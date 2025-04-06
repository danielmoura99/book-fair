//app/(portal)/inventory/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Navbar from "@/components/sidebar";
import InventoryScanner from "./_components/inventory-scanner";
import { InventoryProvider } from "./_components/inventory-context";
import { InventoryCurrentTable } from "./_components/inventory-current-table";
import { Separator } from "@/components/ui/separator";

export default function InventoryPage() {
  return (
    <>
      <Navbar />
      <div className="flex flex-col h-screen bg-background overflow-hidden">
        <InventoryProvider>
          <div className="flex-1 flex flex-col overflow-auto">
            {/* Seção de Atualização de Estoque */}
            <div className="p-6 pb-2">
              <InventoryScanner />
            </div>

            <Separator className="my-4" />

            {/* Seção de Inventário Atual */}
            <div className="p-6 pt-2">
              <h2 className="text-2xl font-bold mb-4">Inventário Atual</h2>
              <InventoryCurrentTable />
            </div>
          </div>
        </InventoryProvider>
      </div>
    </>
  );
}
