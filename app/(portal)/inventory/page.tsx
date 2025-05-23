// app/(portal)/inventory/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Navbar from "@/components/sidebar";
import InventoryScanner from "./_components/inventory-scanner";
import { InventoryProvider } from "./_components/inventory-context";

export default function InventoryPage() {
  return (
    <>
      <Navbar />
      {/* Wrapper com classe text-sm para reduzir fonte em toda a página */}
      <div className="text-sm">
        <InventoryProvider>
          <div className="flex flex-col bg-background overflow-auto">
            <InventoryScanner />
          </div>
        </InventoryProvider>
      </div>
    </>
  );
}
