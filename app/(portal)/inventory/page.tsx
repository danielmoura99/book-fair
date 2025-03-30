//app/(portal)/inventory/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Navbar from "@/components/sidebar";
import InventoryScanner from "./_components/inventory-scanner";
import { InventoryProvider } from "./_components/inventory-context";

export default function InventoryPage() {
  return (
    <>
      <Navbar />
      <div className="flex h-screen bg-background overflow-hidden">
        <InventoryProvider>
          <div className="flex-1 flex flex-col">
            <InventoryScanner />
          </div>
        </InventoryProvider>
      </div>
    </>
  );
}
