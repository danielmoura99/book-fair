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
import { UserCircle, Users, UserPlus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { setStationItem, removeStationItem } from "@/lib/station-storage";

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

  // Se tiver um operador selecionado, mostra o card compacto
  if (selectedOperator) {
    return (
      <Card className="p-3 min-h-[72px]">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-3">
            <UserCircle className="w-6 h-6 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Operador:</p>
              <p className="font-semibold">{selectedOperator}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Dialog open={openSelect} onOpenChange={setOpenSelect}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-1" />
                  Trocar
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Selecionar Operador</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="grid gap-3">
                    {operators?.map((operator: any) => (
                      <Button
                        key={operator.id}
                        variant="outline"
                        className="w-full justify-start py-3"
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
                <div className="pt-4 border-t">
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => {
                      setOpenSelect(false);
                      setOpenNew(true);
                    }}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Cadastrar Novo Operador
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onOperatorSelect("");
                removeStationItem("lastOperator");
              }}
            >
              Retirar
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
      </Card>
    );
  }

  // Se não tiver operador selecionado, mostra apenas um botão para abrir o dialog
  return (
    <Card className="p-4 border-2 border-orange-500">
      <div className="text-center space-y-4">
        <div>
          <h2 className="text-xl font-bold">Primeiro Passo</h2>
          <p className="text-muted-foreground">
            Selecione ou cadastre o operador antes de iniciar a venda
          </p>
        </div>

        <Dialog open={openSelect} onOpenChange={setOpenSelect}>
          <DialogTrigger asChild>
            <Button className="w-full" size="lg">
              <Users className="mr-2 h-5 w-5" />
              Selecionar Operador
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Selecionar Operador</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid gap-3">
                {operators?.map((operator: any) => (
                  <Button
                    key={operator.id}
                    variant="outline"
                    className="w-full justify-start py-3"
                    onClick={() => {
                      onOperatorSelect(operator.name);
                      setStationItem("lastOperator", operator.name);
                      setOpenSelect(false);
                    }}
                  >
                    <UserCircle className="mr-2 h-5 w-5" />
                    {operator.name}
                  </Button>
                ))}
              </div>
            </ScrollArea>
            <div className="pt-4 border-t">
              <Button
                variant="default"
                className="w-full"
                onClick={() => {
                  setOpenSelect(false);
                  setOpenNew(true);
                }}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Cadastrar Novo Operador
              </Button>
            </div>
          </DialogContent>
        </Dialog>

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
