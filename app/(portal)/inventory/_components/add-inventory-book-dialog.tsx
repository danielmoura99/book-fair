// app/(portal)/inventory/_components/add-inventory-book-dialog.tsx
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

// Schema para validação do formulário
const inventoryBookSchema = z.object({
  codFle: z.string().min(1, "Código FLE é obrigatório"),
  barCode: z.string().optional(),
  location: z.string().default("ESTOQUE"),
  quantity: z.coerce.number().min(0, "Quantidade deve ser maior ou igual a 0"),
  coverPrice: z.coerce
    .number()
    .min(0, "Preço de feira deve ser maior ou igual a 0"),
  price: z.coerce.number().min(0, "Preço de capa deve ser maior ou igual a 0"),
  title: z.string().min(1, "Título é obrigatório"),
  author: z.string().min(1, "Autor é obrigatório"),
  medium: z.string().default("Não informado"),
  publisher: z.string().min(1, "Editora é obrigatória"),
  distributor: z.string().default("Não informado"),
  subject: z.string().default("Não informado"),
});

type InventoryBookFormValues = z.infer<typeof inventoryBookSchema>;

interface AddInventoryBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddInventoryBookDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddInventoryBookDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<InventoryBookFormValues>({
    resolver: zodResolver(inventoryBookSchema),
    defaultValues: {
      codFle: "",
      barCode: "",
      location: "ESTOQUE",
      quantity: 0,
      coverPrice: 0,
      price: 0,
      title: "",
      author: "",
      medium: "Não informado",
      publisher: "",
      distributor: "Não informado",
      subject: "Não informado",
    },
  });

  const onSubmit = async (data: InventoryBookFormValues) => {
    try {
      setLoading(true);

      // Enviar dados para a API
      await axios.post("/api/inventory", {
        book: {
          ...data,
          coverPrice: data.coverPrice.toString(),
          price: data.price.toString(),
        },
        operatorName: "Usuário Atual",
      });

      toast({
        title: "Livro adicionado",
        description: `O livro "${data.title}" foi adicionado ao inventário com sucesso.`,
      });

      // Resetar formulário
      form.reset();

      // Fechar diálogo e executar callback de sucesso
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Erro ao adicionar livro:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o livro ao inventário.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Adicionar Novo Livro ao Inventário</DialogTitle>
          <DialogDescription>
            Preencha os dados do livro que deseja adicionar ao inventário.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] px-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 py-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="codFle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código FLE*</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: 1234" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="barCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código de Barras</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: 9780123456789" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Título*</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Título do livro" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Autor*</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome do autor" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="medium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Médium</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Chico Xavier" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="publisher"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Editora*</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: FEB" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="distributor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distribuidor</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome do distribuidor" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assunto</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Espiritismo" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="coverPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço Feira*</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...field}
                          placeholder="Ex: 25.90"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço Capa</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...field}
                          placeholder="Ex: 29.90"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter className="p-6 pt-2">
          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            onClick={form.handleSubmit(onSubmit)}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adicionando...
              </>
            ) : (
              "Adicionar Livro"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
