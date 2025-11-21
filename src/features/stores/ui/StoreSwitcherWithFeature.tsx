import * as React from "react";
import { Check, ChevronsUpDown, Plus, Store } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getJsonCookie, COOKIE_NAMES } from "@/lib/utils";
import type { CurrentStore } from "@/features/auth/types/interface";
import type { CreateStoreRequest } from "@/features/stores";
import { CreateStoreForm } from "./CreateStoreForm";
import type { StoreOption } from "@/components/store-switcher";
import {
  useStores,
  useCreateStore,
  useSwitchStore,
} from "../hooks/useStoresQuery";
import { authService } from "@/features/auth/services/authService";

export function StoreSwitcherWithFeature() {
  const [currentStore, setCurrentStore] = React.useState<CurrentStore | null>(
    null
  );
  const { data: stores = [], isLoading } = useStores();
  const createStoreMutation = useCreateStore();
  const switchStoreMutation = useSwitchStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);

  React.useEffect(() => {
    const storeFromCookie = getJsonCookie<CurrentStore>(
      COOKIE_NAMES.CURRENT_STORE
    );
    if (storeFromCookie) {
      setCurrentStore(storeFromCookie);
    }
  }, []);

  const storeOptions: StoreOption[] = stores.map((store: any) => ({
    id: store.id,
    name: store.name,
    description: store.description,
  }));

  const handleStoreChange = async (storeOption: StoreOption) => {
    try {
      const result = await switchStoreMutation.mutateAsync(storeOption.id);

      authService.storeTokens({
        accessToken: result.accessToken,
        refreshToken: authService.getRefreshToken() || "",
      });

      const currentStoreData = {
        id: result.currentStore.id,
        name: result.currentStore.name,
        description: result.currentStore.description || "",
        role: "OWNER", // Default role, bisa disesuaikan dengan data dari API
      };
      authService.setCurrentStore(currentStoreData);

      setCurrentStore(currentStoreData);

      window.location.reload();
    } catch (error) {
      console.error("Failed to switch store:", error);
    }
  };

  const handleCreateStore = async (data: CreateStoreRequest) => {
    try {
      await createStoreMutation.mutateAsync(data);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Failed to create store:", error);
    }
  };

  const handleCancel = () => {
    setIsCreateDialogOpen(false);
  };

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            disabled
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Store className="size-4" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-semibold">Loading stores...</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Store className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold line-clamp-1">
                    {currentStore?.name || "Select Store"}
                  </span>
                  {currentStore?.description && (
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {currentStore.description}
                    </span>
                  )}
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-[250px] max-w-[250px] max-h-[300px] overflow-y-auto"
              align="start"
            >
              <DropdownMenuLabel>My Stores</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {storeOptions.map((store) => (
                <DropdownMenuItem
                  key={store.id}
                  onSelect={() => handleStoreChange(store)}
                  className="gap-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-sidebar-primary/10">
                      <Store className="h-3 w-3" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium line-clamp-1">
                        {store.name}
                      </span>
                      {store.description && (
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {store.description}
                        </span>
                      )}
                    </div>
                  </div>
                  {store.id === currentStore?.id && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setIsCreateDialogOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create New Store
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Store</DialogTitle>
            <DialogDescription>
              Add a new store to your account. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          <CreateStoreForm
            onSubmit={handleCreateStore}
            onCancel={handleCancel}
            isSubmitting={createStoreMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
