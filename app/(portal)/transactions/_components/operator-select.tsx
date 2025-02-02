/* eslint-disable @typescript-eslint/no-explicit-any */
//app/(portal)/transactions/_components/operator-select.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { UserCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OperatorSelectorProps {
  onOperatorSelect: (operatorName: string) => void;
  selectedOperator: string | null;
}

const formSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
});

export function OperatorSelector({
  onOperatorSelect,
  selectedOperator,
}: OperatorSelectorProps) {
  const [openSelect, setOpenSelect] = useState(false);
  const [openNew, setOpenNew] = useState(false);
  const queryClient = useQueryClient();

  const { data: operators } = useQuery({
    queryKey: ["operators"],
    queryFn: async () => {
      const response = await axios.get("/api/operators");
      return response.data;
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post("/api/operators", values);
      await queryClient.invalidateQueries({ queryKey: ["operators"] });
      setOpenNew(false);
      onOperatorSelect(values.name);
      form.reset();
    } catch (error) {
      console.error("Erro ao criar operador:", error);
    }
  };

  // Se tiver um operador selecionado, mostra o card com as informações
  if (selectedOperator) {
    return (
      <Card className="p-4 mb-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-2">
            <UserCircle className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">
                Operador Selecionado:
              </p>
              <p className="text-lg font-semibold">{selectedOperator}</p>
            </div>
          </div>

          <div className="flex gap-4 w-full">
            <div className="flex-1">
              <Dialog open={openSelect} onOpenChange={setOpenSelect}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Trocar Operador
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="mb-4">
                      Selecione o Operador
                    </DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="grid gap-4">
                      {operators?.map((operator: any) => (
                        <Button
                          key={operator.id}
                          variant="outline"
                          className="w-full justify-start text-lg py-6"
                          onClick={() => {
                            onOperatorSelect(operator.name);
                            setOpenSelect(false);
                          }}
                        >
                          <UserCircle className="mr-2 h-5 w-5" />
                          {operator.name}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => {
                        setOpenSelect(false);
                        setOpenNew(true);
                      }}
                    >
                      Cadastrar Novo Operador
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex-1">
              <Button
                variant="outline"
                onClick={() => {
                  onOperatorSelect("");
                  localStorage.removeItem("lastOperator");
                }}
                className="w-full"
              >
                Retirar Operador
              </Button>
            </div>
          </div>

          <Dialog open={openNew} onOpenChange={setOpenNew}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Operador</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Operador</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Digite o nome do operador"
                            className="text-lg"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Adicionar
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    );
  }

  // Se não tiver operador selecionado, mostra a seleção inicial
  return (
    <Card className="p-4 mb-6 border-2 border-orange-500 max-h-[500px]">
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold">Primeiro Passo</h2>
          <p className="text-muted-foreground">
            Selecione ou cadastre o operador antes de iniciar a venda
          </p>
        </div>

        <ScrollArea className="h-[250px]">
          <div className="grid gap-4 pr-4">
            {operators?.map((operator: any) => (
              <Button
                key={operator.id}
                variant="outline"
                className="w-full justify-start text-lg py-4"
                onClick={() => {
                  onOperatorSelect(operator.name);
                  localStorage.setItem("lastOperator", operator.name);
                }}
              >
                <UserCircle className="mr-2 h-5 w-5" />
                {operator.name}
              </Button>
            ))}
          </div>
        </ScrollArea>

        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogTrigger asChild>
            <Button className="w-full">Cadastrar Novo Operador</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Operador</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Operador</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Digite o nome do operador"
                          className="text-lg"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Adicionar
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
}
