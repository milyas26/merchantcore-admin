import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Users,
  Tag,
  FileText,
  Store,
  Settings,
} from "lucide-react";

import { StoreSwitcher } from "./store-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

// Navigation data for e-commerce admin
const data = {
  stores: [
    {
      id: "1",
      name: "Main Store",
      description: "Jakarta Utara",
    },
    {
      id: "2",
      name: "Branch Store",
      description: "Jakarta Selatan",
    },
    {
      id: "3",
      name: "Online Store",
      description: "E-commerce",
    },
  ],
  navMain: [
    {
      title: "Main Menu",
      items: [
        {
          title: "Dashboard",
          url: "/",
          icon: LayoutDashboard,
        },
        {
          title: "Orders",
          url: "/orders",
          icon: ShoppingCart,
        },
        {
          title: "Customers",
          url: "/customers",
          icon: Users,
        },
      ],
    },
    {
      title: "Catalog & Inventory",
      items: [
        {
          title: "Catalog",
          url: "/catalog",
          icon: Package,
        },
        {
          title: "Inventory",
          url: "/inventory",
          icon: Boxes,
        },
      ],
    },
    {
      title: "Marketing & Reports",
      items: [
        {
          title: "Promotions",
          url: "/promotions",
          icon: Tag,
        },
        {
          title: "Reports",
          url: "/reports",
          icon: FileText,
        },
      ],
    },
    {
      title: "Configuration",
      items: [
        {
          title: "Storefront",
          url: "/storefront",
          icon: Store,
        },
        {
          title: "Settings",
          url: "/settings",
          icon: Settings,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();

  const handleStoreChange = (store: any) => {
    console.log("Store changed to:", store);
    // TODO: Implement store switching logic
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <StoreSwitcher
          stores={data.stores}
          defaultStore={data.stores[0]}
          onStoreChange={handleStoreChange}
        />
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
