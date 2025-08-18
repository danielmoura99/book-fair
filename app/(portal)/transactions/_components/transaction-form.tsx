/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
//app/(portal)/transactions/_components/transaction-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Book } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Barcode, List, Search, Monitor } from "lucide-react";
import { CartItem } from "./cart-item";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCashRegister } from "@/hooks/use-cash-register";
import { OperatorSelector } from "./operator-select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PaymentManager } from "./payment-manager";
import { BarcodeScanner } from "./barcode-scannet";
import { BookSearchList } from "./book-search-list";
import { formatPrice } from "@/lib/utils";

import { PrintReceiptDialog } from "@/components/print-receipt-dialog";
import { usePrinter } from "@/hooks/use-printer";
import { SaleData } from "@/lib/printer-utils";
import { StationIdentifier } from "@/components/station-identifier";
import { getStationItem, setStationItem } from "@/lib/station-storage";

const formSchema = z.object({
  operatorName: z.string().min(1, "Selecione o operador"),
});

interface CartItemType {
  bookId: string;
  quantity: number;
  book: Book;
}

interface PaymentSplit {
  method: string;
  amount: number;
  change?: number;
  amountReceived?: number;
}

export function TransactionForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [searchFleCode, setSearchFleCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(
    () => {
      if (typeof window !== "undefined") {
        return getStationItem("lastOperator");
      }
      return null;
    }
  );
  const [payments, setPayments] = useState<PaymentSplit[]>([]);

  // NOVOS ESTADOS PARA IMPRESSÃO
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [saleDataForPrint, setSaleDataForPrint] = useState<SaleData | null>(
    null
  );

  const { isOpen: isCashRegisterOpen } = useCashRegister();

  // NOVO HOOK DE IMPRESSÃO
  const { shouldShowPrintDialog, prepareSaleData } = usePrinter();

  const { data: books } = useQuery<Book[]>({
    queryKey: ["books"],
    queryFn: async () => {
      const response = await axios.get("/api/books");
      return response.data;
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      operatorName: selectedOperator || "",
    },
  });

  const handleSearchByFle = () => {
    const book = books?.find((b) => b.codFle === searchFleCode);
    if (book) {
      addToCart(book);
      setSearchFleCode("");
    }
  };

  const addToCart = (book: Book) => {
    if (!selectedOperator) {
      setError("Selecione um operador antes de adicionar itens");
      return;
    }

    if (book.quantity <= 0) {
      setError("Livro sem estoque disponível");
      return;
    }

    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.bookId === book.id);
      if (existingItem) {
        if (existingItem.quantity >= book.quantity) {
          setError("Quantidade máxima disponível atingida");
          return prev;
        }
        return prev.map((item) =>
          item.bookId === book.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // Novo livro aparece no topo da lista
      return [{ bookId: book.id, quantity: 1, book }, ...prev];
    });
    setError(null);
  };

  const updateQuantity = (bookId: string, quantity: number) => {
    const book = books?.find((b) => b.id === bookId);
    if (!book) return;

    if (quantity > book.quantity) {
      setError("Quantidade solicitada maior que estoque disponível");
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.bookId === bookId ? { ...item, quantity } : item
      )
    );
    setError(null);
  };

  const removeFromCart = (bookId: string) => {
    setCartItems((prev) => prev.filter((item) => item.bookId !== bookId));
    setError(null);
  };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + Number(item.book.coverPrice) * item.quantity,
    0
  );

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!isCashRegisterOpen) {
      setError("O caixa precisa estar aberto para registrar vendas");
      return;
    }

    if (!selectedOperator) {
      setError("Selecione um operador antes de finalizar a venda");
      return;
    }

    const paymentSum =
      Math.round(payments.reduce((sum, p) => sum + p.amount, 0) * 100) / 100;
    const roundedTotal = Math.round(totalAmount * 100) / 100;

    const EPSILON = 0.01;
    if (Math.abs(paymentSum - roundedTotal) > EPSILON) {
      setError(
        "O valor total dos pagamentos não corresponde ao valor da venda"
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("🛒 Processando venda...");

      // EXECUTAR A VENDA (código original mantido)
      const response = await axios.post("/api/transactions/bulk", {
        items: cartItems.map((item) => ({
          bookId: item.bookId,
          quantity: item.quantity,
          itemTotal: (Number(item.book.coverPrice) * item.quantity).toString(),
        })),
        totalAmount: totalAmount.toString(),
        operatorName: selectedOperator,
        payments: payments,
        date: new Date().toISOString(),
      });

      console.log("✅ Venda processada com sucesso:", response.data);

      // NOVA FUNCIONALIDADE: Verificar se deve mostrar dialog de impressão
      console.log("🖨️ Verificando disponibilidade de impressora...");

      const showPrint = await shouldShowPrintDialog();

      console.log("🖨️ Resultado da verificação:", showPrint);

      if (showPrint) {
        console.log(
          "✅ Impressora detectada! Preparando dados para impressão..."
        );

        // Preparar dados para impressão
        const saleData = prepareSaleData(
          cartItems,
          totalAmount,
          selectedOperator,
          payments,
          response.data?.sequentialId
        );

        console.log("📄 Dados da venda preparados:", saleData);

        setSaleDataForPrint(saleData);
        setShowPrintDialog(true);

        console.log("🔔 Dialog de impressão deve aparecer agora!");
      } else {
        console.log(
          "❌ Nenhuma impressora detectada. Continuando sem impressão..."
        );
        // Não há impressora, continuar normalmente
        handleSaleComplete();
      }
    } catch (error) {
      console.error("❌ Erro na venda:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Erro ao processar venda");
      }
    } finally {
      setLoading(false);
    }
  };

  // NOVA FUNÇÃO PARA COMPLETAR A VENDA
  const handleSaleComplete = () => {
    router.refresh();
    onSuccess?.();

    // Limpar formulário (código original mantido)
    setCartItems([]);
    setPayments([]);
    setError(null);
  };

  return (
    <>
      {/* Operador e Estação na mesma linha */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Seleção do Operador - Lado Esquerdo */}
        <div>
          <OperatorSelector
            selectedOperator={selectedOperator}
            onOperatorSelect={(name) => {
              setSelectedOperator(name);
              if (name) {
                setStationItem("lastOperator", name);
              }
            }}
          />
        </div>

        {/* Identificação da Estação - Lado Direito */}
        <Card className="p-2 h-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Monitor className="w-6 h-9 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Estação:</p>
                <div className="font-semibold">
                  <StationIdentifier />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {/* Área reservada para manter simetria com operador */}
            </div>
          </div>
        </Card>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          onKeyDown={(e) => {
            // ✅ CORREÇÃO MELHORADA: Apenas capturar eventos que originam DENTRO do form
            if (e.key === "Enter" && e.target instanceof HTMLElement) {
              const target = e.target;
              
              // Verificar se o evento realmente originou de dentro do form
              const form = e.currentTarget as HTMLFormElement;
              if (!form.contains(target)) {
                return; // Ignorar eventos de fora do form
              }
              
              // NÃO bloquear em botões ou inputs específicos DENTRO do form
              if (
                target.tagName === "BUTTON" ||
                target.closest('[data-scanner-area]') || // Área do scanner
                (target instanceof HTMLInputElement && target.placeholder?.toLowerCase().includes('código')) ||
                target.classList.contains('search-input')
              ) {
                return; // Permitir comportamento normal
              }
              
              // Bloquear apenas em outros inputs dentro do form para evitar submit acidental
              if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
                e.preventDefault();
              }
            }
          }}
          className="space-y-4"
        >
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div
                className={
                  !selectedOperator ? "opacity-50 pointer-events-none" : ""
                }
              >
                <Card className="p-4">
                  <Tabs defaultValue="scanner">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger
                        value="scanner"
                        className="text-xs sm:text-sm"
                      >
                        <Barcode className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Scanner</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="search"
                        className="text-xs sm:text-sm"
                      >
                        <Search className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Código FLE</span>
                      </TabsTrigger>
                      <TabsTrigger value="list" className="text-xs sm:text-sm">
                        <List className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Lista</span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="search" className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Digite o código FLE"
                          value={searchFleCode}
                          onChange={(e) => setSearchFleCode(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSearchByFle();
                            }
                          }}
                          className="text-sm search-input"
                        />
                        <Button
                          type="button"
                          onClick={handleSearchByFle}
                          size="sm"
                        >
                          Buscar
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="list">
                      <BookSearchList
                        onSelectBook={addToCart}
                        disabled={!selectedOperator}
                      />
                    </TabsContent>

                    <TabsContent value="scanner">
                      <BarcodeScanner
                        onScan={(book) => addToCart(book)}
                        disabled={!selectedOperator}
                      />
                    </TabsContent>
                  </Tabs>

                  {/* ✅ CORRIGIDO: ScrollArea para carrinho com overflow nativo */}
                  <div className="mt-4">
                    <div className="h-[200px] sm:h-[300px] overflow-auto border rounded-md p-2">
                      <div className="space-y-2">
                        {cartItems.map((item) => (
                          <CartItem
                            key={item.bookId}
                            item={item}
                            onUpdateQuantity={updateQuantity}
                            onRemove={removeFromCart}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <div className="space-y-4">
              {cartItems.length > 0 && (
                <Card className="p-4 sm:p-6">
                  <PaymentManager
                    totalAmount={totalAmount}
                    onPaymentsChange={setPayments}
                    disabled={loading || !isCashRegisterOpen}
                  />

                  <div className="mt-4 pt-4 border-t">
                    <h3 className="text-base sm:text-lg font-medium mb-3">
                      Resumo da Venda
                    </h3>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total de Itens:</span>
                        <span className="font-medium">
                          {cartItems.reduce(
                            (sum, item) => sum + item.quantity,
                            0
                          )}{" "}
                          livros
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span>Valor Normal:</span>
                        <span className="font-medium text-red-500 line-through">
                          {formatPrice(
                            cartItems.reduce(
                              (sum, item) =>
                                sum + Number(item.book.price) * item.quantity,
                              0
                            )
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Desconto:</span>
                        <span>
                          {formatPrice(
                            cartItems.reduce(
                              (sum, item) =>
                                sum +
                                (Number(item.book.price) -
                                  Number(item.book.coverPrice)) *
                                  item.quantity,
                              0
                            )
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm font-medium">
                        <span>Valor Feira:</span>
                        <span className="text-blue-600">
                          {formatPrice(totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-4"
                    disabled={
                      loading ||
                      cartItems.length === 0 ||
                      !isCashRegisterOpen ||
                      payments.reduce((sum, p) => sum + p.amount, 0) !==
                        totalAmount
                    }
                  >
                    {loading
                      ? "Processando..."
                      : !isCashRegisterOpen
                      ? "Abra o caixa primeiro"
                      : "Finalizar Venda"}
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </form>
      </Form>

      {/* ADICIONAR APENAS ESTE NOVO DIALOG */}
      <PrintReceiptDialog
        open={showPrintDialog}
        onOpenChange={setShowPrintDialog}
        saleData={saleDataForPrint}
        onComplete={handleSaleComplete}
      />
    </>
  );
}
