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
import { PaymentMethodSelect } from "./payment-method-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCashRegister } from "@/hooks/use-cash-register";

const formSchema = z.object({
  paymentMethod: z.string().min(1, "Selecione uma forma de pagamento"),
  fleCode: z.string().optional(),
});

interface CartItemType {
  bookId: string;
  quantity: number;
  book: Book;
}

export function TransactionForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [searchFleCode, setSearchFleCode] = useState("");
  const [error, setError] = useState<string | null>(null);

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
      paymentMethod: "",
      fleCode: "",
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!isCashRegisterOpen) {
      setError("O caixa precisa estar aberto para registrar vendas");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Criar uma transação para cada item do carrinho
      await Promise.all(
        cartItems.map((item) =>
          axios.post("/api/transactions", {
            bookId: item.bookId,
            quantity: item.quantity,
            paymentMethod: values.paymentMethod,
            totalAmount: (
              Number(item.book.coverPrice) * item.quantity
            ).toString(),
            date: new Date().toISOString(),
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

        <div className="space-y-4">
          {cartItems.map((item) => (
            <CartItem
              key={item.bookId}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
            />
          ))}
        </div>

        {cartItems.length > 0 && (
          <>
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(totalAmount)}
              </span>
            </div>

            <PaymentMethodSelect control={form.control} />

            <Button
              type="submit"
              className="w-full"
              disabled={
                loading || cartItems.length === 0 || !isCashRegisterOpen
              }
            >
              {loading
                ? "Processando..."
                : !isCashRegisterOpen
                ? "Abra o caixa primeiro"
                : "Finalizar Venda"}
            </Button>
          </>
        )}
      </form>
    </Form>
  );
}
