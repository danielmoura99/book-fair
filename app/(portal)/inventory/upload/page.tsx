//app/(portal)/inventory/upload/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Navbar from "@/components/sidebar";
import { InventoryUploadForm } from "./_components/inventory-upload-form";

export default function InventoryUploadPage() {
  return (
    <>
      <Navbar />
      <div className="flex h-screen bg-background overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Upload de Inventário</h1>
            <InventoryUploadForm />
          </div>
        </div>
      </div>
    </>
  );
}
