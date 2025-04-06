//app/(portal)/inventory/_components/inventory-items-list.tsx
"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Edit, Check, X, BookOpen } from "lucide-react";
import { useInventory } from "./inventory-context";

export function InventoryItemsList() {
  const { pendingUpdates, addUpdate, removeUpdate } = useInventory();
  const [searchTerm, setSearchTerm] = useState("");
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);

  // Filtragem de itens
  const filteredItems = pendingUpdates.filter(
    (item) =>
      item.book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.book.codFle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.book.barCode?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      )
  );

  const handleStartEdit = (bookId: string, currentQuantity: number) => {
    setEditItemId(bookId);
    setEditQuantity(currentQuantity);
  };

  const handleSaveEdit = (bookId: string) => {
    const item = pendingUpdates.find((update) => update.bookId === bookId);
    if (item) {
      addUpdate(item.book, editQuantity);
    }
    setEditItemId(null);
  };

  if (pendingUpdates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] p-4 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium">Nenhuma atualização pendente</h3>
        <p className="text-muted-foreground">
          Use o scanner ou a busca para adicionar livros ao inventário
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Pesquisar por título, código FLE ou código de barras"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredItems.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Código FLE</TableHead>
                <TableHead>Título</TableHead>
                <TableHead className="text-center w-[120px]">
                  Qtd. Atual
                </TableHead>
                <TableHead className="text-center w-[120px]">
                  Nova Qtd.
                </TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.bookId}>
                  <TableCell className="font-medium">
                    <div>{item.book.codFle}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.book.barCode || "Sem código de barras"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{item.book.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.book.publisher} | {item.book.author}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {item.previousQuantity}
                  </TableCell>
                  <TableCell className="text-center">
                    {editItemId === item.bookId ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          min="0"
                          value={editQuantity}
                          onChange={(e) =>
                            setEditQuantity(Number(e.target.value))
                          }
                          className="w-20 h-8 text-sm"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleSaveEdit(item.bookId)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => setEditItemId(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="font-medium">{item.newQuantity}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleStartEdit(item.bookId, item.newQuantity)
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeUpdate(item.bookId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">
            Nenhum item encontrado para {searchTerm}. Tente outro termo de
            busca.
          </p>
        </div>
      )}

      <div className="text-sm text-muted-foreground">
        Total: {filteredItems.length} atualizações pendentes
      </div>
    </div>
  );
}
