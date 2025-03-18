//app/layout
import type { Metadata } from "next";
import "./globals.css";
import { Mulish } from "next/font/google";
import { QueryClientProvider } from "@/components/providers/query-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";

const mulish = Mulish({
  subsets: ["latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mulish",
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
    <html lang="pt-BR" className="text-base">
      <head>
        {/* Meta tag para garantir escala responsiva e legível em dispositivos móveis */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=5.0"
        />
      </head>
      <body className={`${mulish.className} text-base antialiased`}>
        <QueryClientProvider>
          <SidebarProvider>
            <AppSidebar />
            <main className="flex-1 overflow-y-auto p-8 overflow-hidden">
              <SidebarTrigger />
              <div className="max-w-7xl mx-auto">{children}</div>
            </main>
          </SidebarProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
