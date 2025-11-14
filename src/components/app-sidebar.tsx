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
  Megaphone,
  LogOut,
  FolderOpen,
} from "lucide-react";

import { StoreSwitcher } from "./store-switcher";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
          title: "Category",
          url: "/categories",
          icon: FolderOpen,
        },
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
          title: "Announcement",
          url: "/announcement",
          icon: Megaphone,
        },
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
  const { user, logout } = useAuth();

  const handleStoreChange = (store: any) => {
    console.log("Store changed to:", store);
    // TODO: Implement store switching logic
  };

  const handleLogout = async () => {
    await logout();
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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-medium">
                  {user?.name || "User"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user?.email || "user@example.com"}
                </span>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    title="Logout"
                    className="cursor-pointer"
                  >
                    <LogOut className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to logout? You will need to login
                      again to access the admin panel.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout}>
                      Logout
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
