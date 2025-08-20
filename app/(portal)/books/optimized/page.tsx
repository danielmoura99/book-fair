import Navbar from "@/components/sidebar";
import { AddBookButton } from "../_components/add-book-button";
import { UploadBooks } from "../_components/upload-books";
import { OptimizedBookTable } from "../_components/optimized-book-table";
import { AdminAuth } from "@/components/admin-auth";

export default function OptimizedBooksPage() {
  return (
    <AdminAuth pageName="books">
      <Navbar />
      <div className="flex h-full flex-col space-y-6 overflow-hidden px-2 py-6 max-w-full">
        <div className="flex w-full items-center justify-between px-4">
          <h2 className="text-2xl font-bold">Livros</h2>
          <div className="flex items-center gap-4">
            <UploadBooks />
            <AddBookButton />
          </div>
        </div>
        <div className="px-1">
          <OptimizedBookTable />
        </div>
      </div>
    </AdminAuth>
  );
}
