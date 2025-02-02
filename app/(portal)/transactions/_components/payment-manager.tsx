//app/(portal)/transactions/_components/payment-manager.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { Trash2 } from "lucide-react";

interface PaymentSplit {
  method: string;
  amount: number;
  change?: number;
  amountReceived?: number;
}

interface PaymentManagerProps {
  totalAmount: number;
  onPaymentsChange: (payments: PaymentSplit[]) => void;
  disabled?: boolean;
}

const PAYMENT_METHODS = {
  CASH: "Dinheiro",
  CREDIT_CARD: "Cartão de Crédito",
  DEBIT_CARD: "Cartão de Débito",
  PIX: "PIX",
};

export function PaymentManager({
  totalAmount,
  onPaymentsChange,
  disabled = false,
}: PaymentManagerProps) {
  const [payments, setPayments] = useState<PaymentSplit[]>([]);
  const [currentMethod, setCurrentMethod] = useState<string>("");
  const [currentAmount, setCurrentAmount] = useState<string>("");
  const [amountReceived, setAmountReceived] = useState<string>("");

  const remainingAmount =
    totalAmount - payments.reduce((sum, payment) => sum + payment.amount, 0);

  const handleAddPayment = () => {
    if (!currentMethod || !currentAmount) return;

    const amount = parseFloat(currentAmount);
    if (amount <= 0 || amount > remainingAmount) return;

    if (currentMethod === "CASH" && amountReceived) {
      const received = parseFloat(amountReceived);
      // Verificamos se o valor recebido é suficiente
      if (received >= amount) {
        const change = received - amount;
        const newPayment: PaymentSplit = {
          method: currentMethod,
          amount: amount, // Valor que o cliente efetivamente está pagando (valor restante)
          amountReceived: received, // Valor que o cliente entregou
          change: change, // Troco a ser devolvido
        };

        const updatedPayments = [...payments, newPayment];
        setPayments(updatedPayments);
        onPaymentsChange(updatedPayments);
      }
    } else {
      // Para outros métodos de pagamento
      const newPayment: PaymentSplit = {
        method: currentMethod,
        amount,
      };

      const updatedPayments = [...payments, newPayment];
      setPayments(updatedPayments);
      onPaymentsChange(updatedPayments);
    }

    // Limpar campos
    setCurrentMethod("");
    setCurrentAmount("");
    setAmountReceived("");
  };

  const handleRemovePayment = (index: number) => {
    const updatedPayments = payments.filter((_, i) => i !== index);
    setPayments(updatedPayments);
    onPaymentsChange(updatedPayments);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-lg font-semibold">
        <span>Total da Venda:</span>
        <span>{formatPrice(totalAmount)}</span>
      </div>

      {payments.length > 0 && (
        <Card className="p-4">
          <h3 className="font-medium mb-3">Pagamentos Registrados:</h3>
          <div className="space-y-3">
            {payments.map((payment, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-secondary/50 p-2 rounded-md"
              >
                <div>
                  <p className="font-medium">
                    {
                      PAYMENT_METHODS[
                        payment.method as keyof typeof PAYMENT_METHODS
                      ]
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {payment.method === "CASH" && payment.amountReceived && (
                      <>Recebido: {formatPrice(payment.amountReceived)} | </>
                    )}
                    {payment.method === "CASH" &&
                      payment.change &&
                      payment.change > 0 && (
                        <>Troco: {formatPrice(payment.change)} | </>
                      )}
                    Valor: {formatPrice(payment.amount)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemovePayment(index)}
                  disabled={disabled}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {remainingAmount > 0 && !disabled && (
        <Card className="p-4 space-y-4">
          <div className="flex justify-between text-sm">
            <span>Valor Restante:</span>
            <span>{formatPrice(remainingAmount)}</span>
          </div>

          <div className="space-y-4">
            <Select value={currentMethod} onValueChange={setCurrentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PAYMENT_METHODS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Valor"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              min={0}
              max={remainingAmount}
              step={0.01}
            />

            {currentMethod === "CASH" && (
              <Input
                type="number"
                placeholder="Valor Recebido"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                min={currentAmount}
                step={0.01}
              />
            )}

            {currentMethod === "CASH" &&
              amountReceived &&
              parseFloat(amountReceived) > parseFloat(currentAmount) && (
                <div className="text-sm text-muted-foreground">
                  Troco:{" "}
                  {formatPrice(
                    parseFloat(amountReceived) - parseFloat(currentAmount)
                  )}
                </div>
              )}

            <Button
              onClick={handleAddPayment}
              className="w-full"
              disabled={!currentMethod || !currentAmount || disabled}
            >
              Adicionar Pagamento
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
