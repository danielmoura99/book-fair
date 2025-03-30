//app/(portal)/inventory/upload/_components/inventory-upload-form.tsx
"use client";

import { useState, useRef } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  FileUp,
  AlertTriangle,
  CheckCircle,
  Loader2,
  HelpCircle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { InventoryTemplateDownloader } from "./inventory-template-downloader";

// Lista comum de editoras
const COMMON_PUBLISHERS = [
  "DEVL FEB", // FEB
  "DEVL BOA NOVA", // Boa Nova
  "DEVL EME", // EME
  "DEVL PETIT", // Petit
  "DEVL LEAL", // Leal
  "DEVL IDE", // IDE
  "DEVL INTELITERA", // Intelitera
  "DEVL CEAC", // CEAC
  "OUTROS", // Outros
];

export function InventoryUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [batchName, setBatchName] = useState("");
  const [customBatch, setCustomBatch] = useState("");
  const [batchType, setBatchType] = useState<"common" | "custom">("common");
  const [results, setResults] = useState<{
    success?: number;
    errors?: number;
    created?: number;
    updated?: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Verificar se é um arquivo Excel
      if (
        !selectedFile.name.endsWith(".xlsx") &&
        !selectedFile.name.endsWith(".xls")
      ) {
        setError("Por favor, selecione um arquivo Excel (.xlsx ou .xls)");
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Por favor, selecione um arquivo para upload");
      return;
    }

    const effectiveBatchName = batchType === "common" ? batchName : customBatch;

    if (!effectiveBatchName) {
      setError("Por favor, selecione ou digite um nome de lote");
      return;
    }

    try {
      setUploading(true);
      setProgress(10);
      setError(null);
      setSuccess(false);
      setResults(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("batchName", effectiveBatchName);

      // Enviar o arquivo
      const response = await axios.post(
        "/api/inventory/batch/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setProgress(10 + percentCompleted * 0.3); // 10-40%
            }
          },
        }
      );

      // Processamento do arquivo
      setProgress(70);

      // Finalização
      setProgress(100);
      setSuccess(true);
      setResults(response.data.results);

      toast({
        title: "Upload concluído",
        description: `${response.data.results.success} livros foram importados com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message || "Erro ao fazer o upload do arquivo."
        );
      } else {
        setError("Erro desconhecido ao fazer o upload do arquivo.");
      }

      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setFile(null);
    setBatchName("");
    setCustomBatch("");
    setError(null);
    setSuccess(false);
    setResults(null);
    setProgress(0);
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Upload de Arquivo Excel para Inventário</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Sucesso</AlertTitle>
            <AlertDescription className="text-green-700">
              O arquivo foi processado com sucesso!
              {results && (
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    Total processado: <strong>{results.success}</strong>
                  </div>
                  <div>
                    Erros: <strong>{results.errors}</strong>
                  </div>
                  <div>
                    Livros criados: <strong>{results.created}</strong>
                  </div>
                  <div>
                    Livros atualizados: <strong>{results.updated}</strong>
                  </div>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="batch-type">Lote</Label>
            <div className="flex space-x-2">
              <Button
                variant={batchType === "common" ? "default" : "outline"}
                size="sm"
                onClick={() => setBatchType("common")}
                disabled={uploading}
              >
                Lotes Comuns
              </Button>
              <Button
                variant={batchType === "custom" ? "default" : "outline"}
                size="sm"
                onClick={() => setBatchType("custom")}
                disabled={uploading}
              >
                Lote Personalizado
              </Button>
            </div>
          </div>

          {batchType === "common" ? (
            <Select
              value={batchName}
              onValueChange={setBatchName}
              disabled={uploading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um lote" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_PUBLISHERS.map((publisher) => (
                  <SelectItem key={publisher} value={publisher}>
                    {publisher}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={customBatch}
              onChange={(e) => setCustomBatch(e.target.value.toUpperCase())}
              placeholder="Ex: DEVL ESPECIAL"
              disabled={uploading}
            />
          )}

          <div className="text-xs text-muted-foreground flex items-center">
            <HelpCircle className="h-3 w-3 mr-1" />
            {batchType === "custom"
              ? "Recomendamos usar o prefixo 'DEVL' para manter o padrão"
              : "Selecione a editora correspondente ao lote"}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <Label htmlFor="file">Arquivo Excel</Label>
            <InventoryTemplateDownloader />
          </div>
          <Input
            id="file"
            type="file"
            onChange={handleFileChange}
            accept=".xlsx,.xls"
            ref={fileInputRef}
            disabled={uploading}
          />
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              Selecione um arquivo Excel (.xlsx ou .xls) contendo os dados dos
              livros.
            </p>
            <p className="font-medium">
              O arquivo deve ter as colunas na seguinte ordem:
            </p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                <span className="font-medium">Código FLE</span>: Código único do
                livro (obrigatório)
              </li>
              <li>
                <span className="font-medium">Código de Barras</span>: Código de
                barras EAN do livro
              </li>
              <li>
                <span className="font-medium">Local</span>: Localização do livro
                no evento
              </li>
              <li>
                <span className="font-medium">Quantidade</span>: Quantidade
                inicial
              </li>
              <li>
                <span className="font-medium">Preço Feira</span>: Preço do livro
                na feira
              </li>
              <li>
                <span className="font-medium">Preço Capa</span>: Preço de capa
                do livro
              </li>
              <li>
                <span className="font-medium">Título</span>: Nome do livro
              </li>
              <li>
                <span className="font-medium">Autor</span>: Autor do livro
              </li>
              <li>
                <span className="font-medium">Médium</span>: Nome do médium
              </li>
              <li>
                <span className="font-medium">Editora</span>: Nome da editora
              </li>
              <li>
                <span className="font-medium">Distribuidor</span>: Nome do
                distribuidor/fornecedor
              </li>
              <li>
                <span className="font-medium">Assunto</span>: Categoria do livro
              </li>
            </ol>
          </div>
        </div>

        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        {success ? (
          <div className="flex flex-col w-full gap-4">
            <Button onClick={resetForm} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Novo Upload
            </Button>
            <Link href="/inventory" className="w-full">
              <Button variant="outline" className="w-full">
                Ir para Inventário
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <Button
            onClick={handleUpload}
            disabled={!file || uploading || (!batchName && !customBatch)}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <FileUp className="mr-2 h-4 w-4" />
                Enviar Arquivo
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
