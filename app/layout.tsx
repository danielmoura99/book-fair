import type { Metadata } from "next";
import "./globals.css";
import { Mulish } from "next/font/google";
import { QueryClientProvider } from "@/components/providers/query-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";

const mulish = Mulish({
  subsets: ["latin-ext"],
});

export const metadata: Metadata = {
  title: "Book Fair Manager",
  description: "Sistema de gerenciamento de feira de livros",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={mulish.className}>
        <SidebarProvider>
          <AppSidebar />
          <QueryClientProvider>
            <main className="flex-1 overflow-y-auto p-8 overflow-hidden">
              <SidebarTrigger />
              {children}
            </main>
          </QueryClientProvider>
        </SidebarProvider>
      </body>
    </html>
  );
}
