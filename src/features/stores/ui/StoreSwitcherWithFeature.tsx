/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react"
import { Check, ChevronsUpDown, Plus, Store } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { useStoreStore } from "@/features/stores"
import type { CreateStoreRequest } from "@/features/stores"
import { CreateStoreForm } from "./CreateStoreForm"
import type { StoreOption } from "@/components/store-switcher"

interface StoreSwitcherWithFeatureProps {
  onStoreChange?: (store: StoreOption) => void
}

export function StoreSwitcherWithFeature({ 
  onStoreChange 
}: StoreSwitcherWithFeatureProps) {
  const { stores, currentStore, isLoading, fetchStores, createStore, setCurrentStore } = useStoreStore()
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)

  React.useEffect(() => {
    fetchStores()
  }, [])

  // Convert Store to StoreOption format
  const storeOptions: StoreOption[] = stores.map(store => ({
    id: store.id,
    name: store.name,
    description: store.description,
  }))

  const selectedStore = currentStore ? {
    id: currentStore.id,
    name: currentStore.name,
    description: currentStore.description,
  } : storeOptions[0]

  const handleStoreChange = (storeOption: StoreOption) => {
    const store = stores.find(s => s.id === storeOption.id)
    if (store) {
      setCurrentStore(store)
      onStoreChange?.(storeOption)
    }
  }

  const handleCreateStore = async (data: CreateStoreRequest) => {
    try {
      const result = await createStore(data)
      
      if (result.success) {
        toast.success("Store created successfully")
        setIsCreateDialogOpen(false)
      } else {
        toast.error(result.error || "Failed to create store")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    }
  }

  const handleCancel = () => {
    setIsCreateDialogOpen(false)
  }

  if (isLoading && stores.length === 0) {
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
    )
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
                  <span className="font-semibold">{selectedStore?.name || "Select Store"}</span>
                  {selectedStore?.description && (
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
                      <span className="font-medium">{store.name}</span>
                      {store.description && (
                        <span className="text-xs text-muted-foreground">
                          {store.description}
                        </span>
                      )}
                    </div>
                  </div>
                  {store.id === selectedStore?.id && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setIsCreateDialogOpen(true)} className="gap-2">
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
          />
        </DialogContent>
      </Dialog>
    </>
  )
}