// app/(portal)/settings/printer/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Printer, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Settings, 
  Zap,
  Wifi,
  WifiOff
} from "lucide-react";
import Navbar from "@/components/sidebar";
import { 
  isWebSerialSupported, 
  detectPrinterAvailability,
  testPrinterConnection,
  SaleData 
} from "@/lib/printer-utils";
import { useToast } from "@/hooks/use-toast";
import { StationIdentifier } from "@/components/station-identifier";

export default function PrinterSettingsPage() {
  const [isSupported, setIsSupported] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [printerInfo, setPrinterInfo] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkBrowserSupport();
    checkPrinterStatus();
  }, []);

  const checkBrowserSupport = () => {
    setIsSupported(isWebSerialSupported());
  };

  const checkPrinterStatus = async () => {
    try {
      const connected = await detectPrinterAvailability();
      setIsConnected(connected);
      
      if (connected) {
        // Verificar se há informações salvas da impressora
        const savedInfo = localStorage.getItem('printerInfo');
        if (savedInfo) {
          setPrinterInfo(JSON.parse(savedInfo));
        }
      }
    } catch (error) {
      console.error('Erro ao verificar impressora:', error);
      setIsConnected(false);
    }
  };

  const handleConnectPrinter = async () => {
    if (!isSupported) {
      toast({
        variant: "destructive", 
        title: "Navegador não suportado",
        description: "Use Chrome ou Edge para conectar impressoras."
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // @ts-ignore
      const port = await navigator.serial.requestPort();
      
      const printerData = {
        name: `Impressora Térmica`,
        connectedAt: new Date().toISOString(),
        status: 'connected'
      };
      
      localStorage.setItem('printerInfo', JSON.stringify(printerData));
      setPrinterInfo(printerData);
      setIsConnected(true);
      
      toast({
        title: "Impressora conectada!",
        description: "Agora você pode testar a impressão."
      });
      
    } catch (error) {
      console.error('Erro ao conectar impressora:', error);
      toast({
        variant: "destructive",
        title: "Erro na conexão", 
        description: "Não foi possível conectar com a impressora."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestPrint = async () => {
    if (!isConnected) return;
    
    try {
      setIsLoading(true);
      
      const testData: SaleData = {
        operatorName: "TESTE DO SISTEMA",
        totalAmount: 25.50,
        items: [
          {
            title: "Livro de Teste",
            author: "Autor de Exemplo", 
            codFle: "T001",
            quantity: 1,
            unitPrice: 25.50,
            totalPrice: 25.50
          }
        ],
        payments: [
          {
            method: "CASH",
            amount: 25.50
          }
        ],
        saleDate: new Date(),
        sequentialId: 9999
      };

      const success = await testPrinterConnection(testData);
      
      if (success) {
        toast({
          title: "Teste realizado!",
          description: "Impressora está funcionando corretamente."
        });
      }
      
    } catch (error) {
      console.error('Erro no teste:', error);
      toast({
        variant: "destructive", 
        title: "Erro no teste",
        description: "Verifique se a impressora está ligada e com papel."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (isConnected === null) {
      return <Badge variant="secondary">Verificando...</Badge>;
    }
    
    if (isConnected) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Conectada</Badge>;
    }
    
    return <Badge variant="destructive">Desconectada</Badge>;
  };

  const getConnectionIcon = () => {
    if (isConnected === null) return <Wifi className="h-5 w-5 text-gray-500" />;
    if (isConnected) return <CheckCircle className="h-5 w-5 text-green-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Configuração da Impressora</h1>
            <p className="text-muted-foreground">
              Configure e teste sua impressora térmica para recibos
            </p>
          </div>
          <StationIdentifier />
        </div>

        {/* Status da Impressora */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getConnectionIcon()}
              Status da Impressora
            </CardTitle>
            <CardDescription>
              Status atual da conexão com a impressora térmica
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Status:</span>
              {getStatusBadge()}
            </div>
            
            {printerInfo && (
              <>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Nome:</span>
                    <span>{printerInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conectada em:</span>
                    <span>{new Date(printerInfo.connectedAt).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Compatibilidade do Navegador */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Compatibilidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isSupported ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Navegador não suportado!</strong><br />
                  Para usar impressoras térmicas, você precisa do Chrome ou Edge.
                  Safari e Firefox não são compatíveis.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Navegador compatível!</strong><br />
                  Seu navegador suporta impressão direta via USB.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Ações */}
        {isSupported && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Ações
              </CardTitle>
              <CardDescription>
                Configure e teste sua impressora
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button 
                  onClick={handleConnectPrinter}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  {isConnected ? "Reconectar" : "Conectar"} Impressora
                </Button>
                
                <Button 
                  onClick={handleTestPrint}
                  disabled={!isConnected || isLoading}
                  variant="outline"
                  className="w-full"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Testar Impressão
                </Button>
              </div>
              
              <Button 
                onClick={checkPrinterStatus}
                disabled={isLoading}
                variant="ghost"
                className="w-full"
              >
                <WifiOff className="mr-2 h-4 w-4" />
                Verificar Status
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle>Instruções de Configuração</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold">1. Conectar Impressora:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Conecte a impressora térmica via cabo USB</li>
                <li>Ligue a impressora e aguarde inicialização</li>
                <li>Verifique se há papel carregado</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">2. Autorizar no Navegador:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Clique em "Conectar Impressora"</li>
                <li>Selecione sua impressora na lista</li>
                <li>Clique em "Conectar" na janela do navegador</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">3. Testar:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Use o botão "Testar Impressão"</li>
                <li>Verifique se o recibo sai corretamente</li>
                <li>Se houver problemas, reconecte a impressora</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}