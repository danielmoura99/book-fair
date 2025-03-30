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
import {
  Barcode,
  CheckCircle,
  Save,
  List,
  //Trash2,
  RefreshCw,
  FileDown,
} from "lucide-react";
import { useInventory } from "./inventory-context";
import { BatchSelector } from "./batch-selector";
import { InventoryItemsList } from "./inventory-items-list";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function InventoryScanner() {
  const {
    currentBatch,
    inventoryItems,
    addInventoryItem,
    saveBatch,
    isSaving,
    isScanning,
    setIsScanning,
    resetInventory,
  } = useInventory();

  const [barcode, setBarcode] = useState("");
  const [manualBarcode, setManualBarcode] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("scanner");
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

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

          const success = await addInventoryItem(barcode, quantity);
          if (success) {
            setLastScanned(barcode);
            setBarcode("");

            // Após uma leitura bem-sucedida, focar no input de quantidade para facilitar a alteração
            if (quantityInputRef.current) {
              quantityInputRef.current.focus();
              quantityInputRef.current.select();
            }
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
  }, [barcode, addInventoryItem, quantity, isScanning, lastScanned]);

  // Limpar o último código escaneado após 2 segundos
  useEffect(() => {
    if (lastScanned) {
      const timer = setTimeout(() => setLastScanned(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastScanned]);

  const handleManualAdd = async () => {
    if (!manualBarcode) {
      setError("Digite um código de barras");
      return;
    }

    try {
      setError(null);
      const success = await addInventoryItem(manualBarcode, quantity);

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

  const handleExportInventory = () => {
    // Aqui seria a lógica para exportar o inventário para algum formato
    // Por exemplo, um arquivo Excel ou para a tabela Book
    setIsExportDialogOpen(true);
  };

  return (
    <div className="flex-1 p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Inventário de Livros</h1>
        <p className="text-muted-foreground">
          Registre a entrada de livros em lotes por editora
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Coluna Esquerda - Scanner e Controles */}
        <div className="md:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Lote de Entrada</CardTitle>
                {currentBatch && (
                  <Badge variant="default">{currentBatch}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <BatchSelector />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leitura de Livros</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue="scanner"
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="scanner">
                    <Barcode className="mr-2 h-4 w-4" />
                    Scanner Automático
                  </TabsTrigger>
                  <TabsTrigger value="manual">
                    <List className="mr-2 h-4 w-4" />
                    Entrada Manual
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
                      min="1"
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
                    <Label htmlFor="barcode">Código de Barras</Label>
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
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                  </div>

                  <Button onClick={handleManualAdd}>Adicionar Item</Button>
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
                onClick={() => saveBatch()}
                disabled={
                  isSaving || inventoryItems.length === 0 || !currentBatch
                }
                className="w-full"
              >
                {isSaving ? "Salvando..." : "Salvar Inventário"}
                <Save className="ml-2 h-4 w-4" />
              </Button>

              <div className="flex w-full gap-2">
                <Button
                  variant="outline"
                  onClick={resetInventory}
                  disabled={inventoryItems.length === 0}
                  className="flex-1"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Limpar
                </Button>

                <Button
                  variant="outline"
                  onClick={handleExportInventory}
                  disabled={inventoryItems.length === 0}
                  className="flex-1"
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Coluna Direita - Lista de Itens */}
        <div className="md:col-span-7">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Itens no Lote</CardTitle>
                <Badge variant="outline">
                  {inventoryItems.length} itens registrados
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-300px)]">
                <InventoryItemsList />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog para exportação */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar Inventário</DialogTitle>
            <DialogDescription>
              Escolha como deseja exportar os dados do inventário atual.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Button
              onClick={() => {
                console.log("Exportar para Excel");
                setIsExportDialogOpen(false);
              }}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Exportar para Excel
            </Button>

            <Button
              onClick={() => {
                console.log("Transferir para sistema");
                setIsExportDialogOpen(false);
              }}
            >
              <Save className="mr-2 h-4 w-4" />
              Transferir para Sistema da Feira
            </Button>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsExportDialogOpen(false)}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
