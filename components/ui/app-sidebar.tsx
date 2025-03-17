import {
  ArrowLeftRight,
  Book,
  BookDown,
  CircleDollarSign,
  Handshake,
  //Home,
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
  //{
  //   title: "Dashboard",
  //   url: "/dashboard",
  //   icon: Home,
  //   color: "#0070f3",
  // },
  {
    title: "Transações",
    url: "/transactions",
    icon: ArrowLeftRight,
    color: "#0070f3",
  },
  {
    title: "Livros",
    url: "/books",
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
      <SidebarGroupLabel className="flex flex-col py-10 text-xl font-bold font-2xl overflow-hidden">
        <h1 className="text-2xl font-extrabold text-primary">
          Painel de Controle
        </h1>
      </SidebarGroupLabel>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="mb-4">
                  <SidebarMenuButton
                    asChild
                    className="h-16 text-lg font-medium border-2 rounded-xl shadow-sm hover:shadow transition-all"
                    style={{
                      borderColor: item.color,
                      backgroundColor: `${item.color}10`, // Cor com baixa opacidade para o fundo
                    }}
                  >
                    <a href={item.url} className="flex items-center">
                      <div
                        className="p-2 rounded-full mr-3"
                        style={{ backgroundColor: `${item.color}20` }}
                      >
                        <item.icon size={24} style={{ color: item.color }} />
                      </div>
                      <span className="text-base font-bold">{item.title}</span>
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
