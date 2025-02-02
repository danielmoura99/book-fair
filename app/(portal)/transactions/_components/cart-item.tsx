import { Book } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

interface CartItemProps {
  item: {
    bookId: string;
    quantity: number;
    book: Book;
  };
  onUpdateQuantity: (bookId: string, quantity: number) => void;
  onRemove: (bookId: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h4 className="font-medium">{item.book.title}</h4>
          <p className="text-sm text-muted-foreground">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(Number(item.book.coverPrice))}
          </p>
        </div>

        <Input
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) =>
            onUpdateQuantity(item.bookId, Number(e.target.value))
          }
          className="w-20"
        />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(item.bookId)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
