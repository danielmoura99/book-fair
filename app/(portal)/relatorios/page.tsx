// app/(portal)/relatorios/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CashClosingReport } from "./_components/cash-closing-report";
import Navbar from "@/components/sidebar";
import SoldBooksReport from "./_components/sold-books-report";
import InventoryReport from "./_components/inventory-report";
import { AdminAuth } from "@/components/admin-auth";

export default function ReportsPage() {
  return (
    <AdminAuth pageName="Relatórios">
      <Navbar />
      <div className="flex-1 space-y-4 p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
        </div>

        <Tabs defaultValue="books" className="space-y-4">
          <TabsList>
            <TabsTrigger value="books">Livros Vendidos</TabsTrigger>
            <TabsTrigger value="inventory">Livros em Estoque</TabsTrigger>
            <TabsTrigger value="cash">Fechamento de Caixa</TabsTrigger>
          </TabsList>

          <TabsContent value="books" className="space-y-4">
            <Card className="p-6">
              <SoldBooksReport />
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <Card className="p-6">
              <InventoryReport />
            </Card>
          </TabsContent>

          <TabsContent value="cash" className="space-y-4">
            <Card className="p-6">
              <CashClosingReport />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminAuth>
  );
}
