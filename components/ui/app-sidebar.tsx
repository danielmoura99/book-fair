import {
  ArrowLeftRight,
  Book,
  BookDown,
  CircleDollarSign,
  Handshake,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "Vendas",
    url: "/vendas",
    icon: Handshake,
    color: "#0070f3",
  },
  {
    title: "Transações",
    url: "/transactions",
    icon: ArrowLeftRight,
    color: "#0070f3",
  },
  {
    title: "Livros",
    url: "/books/optimized",
    icon: Book,
    color: "#0070f3",
  },
  {
    title: "Caixa",
    url: "/cash",
    icon: CircleDollarSign,
    color: "#0070f3",
  },
  {
    title: "Relatórios",
    url: "/relatorios",
    icon: BookDown,
    color: "#0070f3",
  },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarGroupLabel className="flex flex-col py-10 text-2xl font-bold font-2xl overflow-hidden pl-4">
        <h1 className="text-2xl font-extrabold text-primary">
          Painel de Controle
        </h1>
      </SidebarGroupLabel>
      <SidebarContent>
        <SidebarGroup className="-mx-3">
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="mb-3">
                  <SidebarMenuButton
                    asChild
                    className="h-15 text-xl font-medium border-2 rounded-xl shadow-sm hover:shadow transition-all ml-0"
                    style={{
                      borderColor: item.color,
                      backgroundColor: `${item.color}10`, // Cor com baixa opacidade para o fundo
                    }}
                  >
                    <a
                      href={item.url}
                      className="flex items-center no-underline"
                    >
                      <div
                        className="p-3 rounded-full mr-4"
                        style={{ backgroundColor: `${item.color}20` }}
                      >
                        <item.icon size={32} style={{ color: item.color }} />
                      </div>
                      <span className="text-xl font-bold">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
