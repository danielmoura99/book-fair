import { ArrowLeftRight, Book, Home } from "lucide-react";

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
    title: "Painel Principal",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Transações",
    url: "/transactions",
    icon: ArrowLeftRight,
  },
  {
    title: "Livros",
    url: "/books",
    icon: Book,
  },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarGroupLabel className="flex flex-col py-6 text-1xl text-bold overflow-hidden">
        Painel de Controle - FLE
      </SidebarGroupLabel>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
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
