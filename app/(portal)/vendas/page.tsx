// app/(portal)/vendas/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { AddTransactionButton } from "../transactions/_components/add-transaction-button";
import { ExchangeTransactionButton } from "../transactions/_components/exchange-transaction-button";
import Navbar from "@/components/sidebar";

export default function SalesPage() {
  return (
    <>
      <Navbar />
      <div className="flex h-screen bg-background">
        <div className="flex-1 p-8">
          <div className="max-w-3xl">
            <h1 className="mb-8 text-3xl font-bold">
              O que você deseja fazer?
            </h1>

            <div className="flex flex-col gap-6">
              <div className="group">
                <AddTransactionButton
                  className="h-24 w-72 text-xl"
                  fullWidth
                  showIcon
                  variant="default"
                />
                <p className=" mt-2 text-sm text-muted-foreground">
                  Registrar uma nova venda de livro
                </p>
              </div>

              <div className="group">
                <ExchangeTransactionButton
                  className="h-24 w-72 text-xl"
                  fullWidth
                  showIcon
                  variant="outline"
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  Realizar uma troca ou devolução
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
