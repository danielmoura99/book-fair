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
import { Form, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Barcode, List, Search } from "lucide-react";
import { CartItem } from "./cart-item";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCashRegister } from "@/hooks/use-cash-register";
import { OperatorSelector } from "./operator-select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PaymentManager } from "./payment-manager";

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
        return localStorage.getItem("lastOperator");
      }
      return null;
    }
  );
  const [payments, setPayments] = useState<PaymentSplit[]>([]);

  const { isOpen: isCashRegisterOpen } = useCashRegister();

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
      return [...prev, { bookId: book.id, quantity: 1, book }];
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!isCashRegisterOpen) {
      setError("O caixa precisa estar aberto para registrar vendas");
      return;
    }

    if (!selectedOperator) {
      setError("Selecione um operador antes de finalizar a venda");
      return;
    }

    if (payments.reduce((sum, p) => sum + p.amount, 0) !== totalAmount) {
      setError(
        "O valor total dos pagamentos não corresponde ao valor da venda"
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await Promise.all(
        cartItems.map((item) =>
          axios.post("/api/transactions", {
            bookId: item.bookId,
            quantity: item.quantity,
            operatorName: selectedOperator,
            totalAmount: (
              Number(item.book.coverPrice) * item.quantity
            ).toString(),
            date: new Date().toISOString(),
            payments: payments,
          })
        )
      );

      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Erro ao processar venda");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coluna Esquerda */}
          <div className="space-y-6">
            <OperatorSelector
              selectedOperator={selectedOperator}
              onOperatorSelect={(name) => {
                setSelectedOperator(name);
                if (name) {
                  localStorage.setItem("lastOperator", name);
                }
              }}
            />

            <div
              className={
                !selectedOperator ? "opacity-50 pointer-events-none" : ""
              }
            >
              <Card className="p-4">
                <Tabs defaultValue="search">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="search">
                      <Search className="mr-2 h-4 w-4" />
                      Código FLE
                    </TabsTrigger>
                    <TabsTrigger value="list">
                      <List className="mr-2 h-4 w-4" />
                      Lista
                    </TabsTrigger>
                    <TabsTrigger value="scanner">
                      <Barcode className="mr-2 h-4 w-4" />
                      Scanner
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="search" className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Digite o código FLE"
                        value={searchFleCode}
                        onChange={(e) => setSearchFleCode(e.target.value)}
                      />
                      <Button type="button" onClick={handleSearchByFle}>
                        Buscar
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="list">
                    <Select
                      onValueChange={(bookId) => {
                        const book = books?.find((b) => b.id === bookId);
                        if (book) addToCart(book);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um livro" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <ScrollArea className="h-[300px]">
                          {books
                            ?.sort((a, b) => a.title.localeCompare(b.title))
                            .map((book) => (
                              <SelectItem key={book.id} value={book.id}>
                                {book.title} - {book.codFle} -{" "}
                                {new Intl.NumberFormat("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                }).format(Number(book.coverPrice))}
                                {book.quantity <= 0 ? " (Sem estoque)" : ""}
                              </SelectItem>
                            ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  </TabsContent>

                  <TabsContent value="scanner">
                    <Card className="p-6">
                      <div className="text-center text-muted-foreground">
                        Scanner será implementado em breve
                      </div>
                    </Card>
                  </TabsContent>
                </Tabs>

                <div className="mt-6">
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4 pr-4">
                      {cartItems.map((item) => (
                        <CartItem
                          key={item.bookId}
                          item={item}
                          onUpdateQuantity={updateQuantity}
                          onRemove={removeFromCart}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </Card>
            </div>
          </div>

          {/* Coluna Direita */}
          <div>
            {cartItems.length > 0 && (
              <Card className="p-6">
                <PaymentManager
                  totalAmount={totalAmount}
                  onPaymentsChange={setPayments}
                  disabled={loading || !isCashRegisterOpen}
                />

                <Button
                  type="submit"
                  className="w-full mt-6"
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
  );
}
