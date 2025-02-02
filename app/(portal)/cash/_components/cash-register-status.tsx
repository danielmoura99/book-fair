"use client";

import { CashRegister } from "@prisma/client";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CashRegisterForm } from "./cash-register-form";
import { WithdrawalForm } from "./cash-withdrawal-form";
import { CloseRegisterForm } from "./close-register-form";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CashRegisterStatusProps {
  activeRegister: CashRegister | null;
  currentBalance: number;
}

export function CashRegisterStatus({
  activeRegister,
  currentBalance,
}: CashRegisterStatusProps) {
  const [openWithdrawal, setOpenWithdrawal] = useState(false);
  const [openClose, setOpenClose] = useState(false);

  if (!activeRegister) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Caixa Fechado</h2>
            <p className="text-muted-foreground">
              Abra o caixa para começar as operações
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Abrir Caixa</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Abrir Caixa</DialogTitle>
              </DialogHeader>
              <CashRegisterForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Caixa Aberto</h2>
          <div className="space-y-1">
            <p>
              Valor Inicial: {formatPrice(Number(activeRegister.initialAmount))}
            </p>
            <p className="text-lg font-semibold">
              Saldo Atual: {formatPrice(currentBalance)}
            </p>
          </div>
        </div>
        <div className="space-x-2">
          <Dialog open={openWithdrawal} onOpenChange={setOpenWithdrawal}>
            <DialogTrigger asChild>
              <Button variant="outline">Retirada</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Realizar Retirada</DialogTitle>
              </DialogHeader>
              <WithdrawalForm
                registerId={activeRegister.id}
                onSuccess={() => setOpenWithdrawal(false)}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={openClose} onOpenChange={setOpenClose}>
            <DialogTrigger asChild>
              <Button variant="destructive">Fechar Caixa</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Fechar Caixa</DialogTitle>
              </DialogHeader>
              <CloseRegisterForm
                register={activeRegister}
                expectedAmount={currentBalance}
                onSuccess={() => setOpenClose(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
