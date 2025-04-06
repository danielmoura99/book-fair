/* eslint-disable @typescript-eslint/no-explicit-any */
//app/(portal)/inventory/_components/inventory-scanner.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Barcode, CheckCircle, Save, Search, RefreshCw } from "lucide-react";
import { useInventory } from "./inventory-context";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { UpdatesList } from "./update-list";

export default function InventoryScanner() {
  const {
    pendingUpdates,
    addUpdate,
    isSaving,
    isScanning,
    setIsScanning,
    saveUpdates,
    resetUpdates,
  } = useInventory();

  const [barcode, setBarcode] = useState("");
  const [manualBarcode, setManualBarcode] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("scanner");
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Função para focar no input de código de barras quando o componente montar
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (!isScanning) return;

    const handleKeyDown = async (event: KeyboardEvent) => {
      // Ignorar se for um campo de input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Scanner geralmente termina com Enter
      if (event.key === "Enter" && barcode) {
        try {
          setError(null);
          console.log("Código lido:", barcode);

          // Evitar leituras duplicadas
          if (barcode === lastScanned) {
            setBarcode("");
            return;
          }

          await processBarcode(barcode);
          setLastScanned(barcode);
          setBarcode("");

          // Após uma leitura bem-sucedida, focar no input de quantidade
          if (quantityInputRef.current) {
            quantityInputRef.current.focus();
            quantityInputRef.current.select();
          }
        } catch (error) {
          console.error("Erro ao processar código de barras:", error);
          setError("Ocorreu um erro ao processar o código de barras");
        }
        setBarcode("");
      } else if (event.key.length === 1) {
        // Apenas caracteres únicos (evitar teclas especiais)
        setBarcode((prev) => prev + event.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [barcode, quantity, isScanning, lastScanned]);

  // Limpar o último código escaneado após 2 segundos
  useEffect(() => {
    if (lastScanned) {
      const timer = setTimeout(() => setLastScanned(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastScanned]);

  const processBarcode = async (code: string) => {
    try {
      const response = await axios.get(`/api/inventory/barcode/${code}`);
      const book = response.data;
      addUpdate(book, quantity);
      return true;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        toast({
          title: "Livro não encontrado",
          description: `Código de barras não reconhecido: ${code}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao processar",
          description: "Ocorreu um erro ao processar o código de barras",
          variant: "destructive",
        });
      }
      return false;
    }
  };

  const handleManualAdd = async () => {
    if (!manualBarcode) {
      setError("Digite um código de barras");
      return;
    }

    try {
      setError(null);
      const success = await processBarcode(manualBarcode);

      if (success) {
        setManualBarcode("");
        // Manter o foco no input de código de barras para facilitar a leitura contínua
        if (barcodeInputRef.current) {
          barcodeInputRef.current.focus();
        }
      }
    } catch (error) {
      console.error("Erro ao adicionar item manualmente:", error);
      setError("Ocorreu um erro ao adicionar o item");
    }
  };

  const handleSearch = async () => {
    if (!searchTerm) return;

    setIsSearching(true);
    try {
      const response = await axios.get(
        `/api/inventory/search?term=${encodeURIComponent(searchTerm)}`
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error("Erro na pesquisa:", error);
      setError("Erro ao pesquisar livros");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (book: any) => {
    addUpdate(book, quantity);
    setSearchResults([]);
    setSearchTerm("");
  };

  // Usar o hook useToast
  const { toast } = useToast();

  return (
    <div className="flex-1 p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Inventário de Livros</h1>
        <p className="text-muted-foreground">
          Atualize as quantidades dos livros no catálogo
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Coluna Esquerda - Scanner e Controles */}
        <div className="md:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Atualização de Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue="scanner"
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="scanner">
                    <Barcode className="mr-2 h-4 w-4" />
                    Scanner
                  </TabsTrigger>
                  <TabsTrigger value="manual">
                    <Barcode className="mr-2 h-4 w-4" />
                    Manual
                  </TabsTrigger>
                  <TabsTrigger value="search">
                    <Search className="mr-2 h-4 w-4" />
                    Buscar
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="scanner" className="space-y-4">
                  <div className="flex items-center gap-4 mt-4">
                    <Button
                      variant={isScanning ? "default" : "outline"}
                      onClick={() => setIsScanning(!isScanning)}
                      className="flex-1"
                    >
                      {isScanning ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Scanner Ativo
                        </>
                      ) : (
                        <>
                          <Barcode className="mr-2 h-4 w-4" />
                          Ativar Scanner
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantidade</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      ref={quantityInputRef}
                    />
                  </div>

                  {isScanning && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>Scanner ativo</AlertTitle>
                      <AlertDescription>
                        Aproxime o leitor do código de barras do livro
                      </AlertDescription>
                    </Alert>
                  )}

                  {barcode && (
                    <div className="text-sm text-muted-foreground">
                      Lendo: {barcode}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="manual" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="barcode">Código de Barras ou FLE</Label>
                    <div className="flex gap-2">
                      <Input
                        id="barcode"
                        value={manualBarcode}
                        onChange={(e) => setManualBarcode(e.target.value)}
                        ref={barcodeInputRef}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="manualQuantity">Quantidade</Label>
                    <Input
                      id="manualQuantity"
                      type="number"
                      min="0"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                  </div>

                  <Button onClick={handleManualAdd}>Adicionar</Button>
                </TabsContent>

                <TabsContent value="search" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Buscar por Título ou Autor</Label>
                    <div className="flex gap-2">
                      <Input
                        id="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Digite para buscar..."
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      />
                      <Button onClick={handleSearch} disabled={isSearching}>
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="searchQuantity">Quantidade</Label>
                    <Input
                      id="searchQuantity"
                      type="number"
                      min="0"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                  </div>

                  {searchResults.length > 0 && (
                    <div className="rounded-md border h-60 overflow-auto p-2">
                      {searchResults.map((book) => (
                        <div
                          key={book.id}
                          className="p-2 hover:bg-muted cursor-pointer rounded-sm"
                          onClick={() => handleSelectSearchResult(book)}
                        >
                          <div className="font-medium">{book.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {book.author} | {book.codFle} | {book.publisher}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                variant="default"
                onClick={saveUpdates}
                disabled={isSaving || pendingUpdates.length === 0}
                className="w-full"
              >
                {isSaving ? "Salvando..." : "Salvar Alterações"}
                <Save className="ml-2 h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                onClick={resetUpdates}
                disabled={pendingUpdates.length === 0}
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Descartar Alterações
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Coluna Direita - Lista de Atualizações */}
        <div className="md:col-span-7">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Atualizações Pendentes</CardTitle>
                <Badge variant="outline">
                  {pendingUpdates.length} atualizações
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-300px)]">
                <UpdatesList />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
