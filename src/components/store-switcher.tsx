import * as React from "react"
import { Check, ChevronsUpDown, Store } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export interface StoreOption {
  id: string
  name: string
  description?: string
}

export function StoreSwitcher({
  stores,
  defaultStore,
  onStoreChange,
}: {
  stores: StoreOption[]
  defaultStore: StoreOption
  onStoreChange?: (store: StoreOption) => void
}) {
  const [selectedStore, setSelectedStore] = React.useState(defaultStore)

  const handleStoreChange = (store: StoreOption) => {
    setSelectedStore(store)
    onStoreChange?.(store)
  }

  return (
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
                  {selectedStore.name}
                </span>
                {selectedStore.description && (
                  <span className="text-xs text-muted-foreground">
                    {selectedStore.description}
                  </span>
                )}
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-[250px]"
            align="start"
          >
            {stores.map((store) => (
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
                    <span className="font-medium">{store.name}</span>
                    {store.description && (
                      <span className="text-xs text-muted-foreground">
                        {store.description}
                      </span>
                    )}
                  </div>
                </div>
                {store.id === selectedStore.id && (
                  <Check className="ml-auto h-4 w-4" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}