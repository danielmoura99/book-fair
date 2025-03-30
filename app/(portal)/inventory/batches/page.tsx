//app/(portal)/inventory/batches/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Navbar from "@/components/sidebar";
import { BatchesList } from "./_components/batches-list";

export default function InventoryBatchesPage() {
  return (
    <>
      <Navbar />
      <div className="flex h-screen bg-background overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Lotes de Inventário</h1>
            <BatchesList />
          </div>
        </div>
      </div>
    </>
  );
}
