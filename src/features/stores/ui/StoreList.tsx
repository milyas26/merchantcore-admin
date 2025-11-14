/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { Plus, Store, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useStoreStore } from "../storesStore";
import type { CreateStoreRequest } from "../types/interface";
import { CreateStoreForm } from "./CreateStoreForm";

interface StoreListProps {
  onStoreSelect?: (storeId: string) => void;
}

export function StoreList({ onStoreSelect }: StoreListProps) {
  const { stores, isLoading, fetchStores, createStore } = useStoreStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);

  React.useEffect(() => {
    fetchStores();
  }, []);

  const handleCreateStore = async (data: CreateStoreRequest) => {
    try {
      const result = await createStore(data);

      if (result.success) {
        toast.success("Store created successfully");
        setIsCreateDialogOpen(false);
      } else {
        toast.error(result.error || "Failed to create store");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

  const handleCancel = () => {
    setIsCreateDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-lg bg-muted"></div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted rounded"></div>
                  <div className="h-3 w-24 bg-muted rounded"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 w-full bg-muted rounded"></div>
                <div className="h-3 w-4/5 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Stores</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Store
            </Button>
          </DialogTrigger>
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
      </div>

      {stores.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">
              No stores found
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first store to get started
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Store
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <Card
              key={store.id}
              className="cursor-pointer transition-colors hover:bg-accent/50"
              onClick={() => onStoreSelect?.(store.id)}
            >
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Store className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{store.name}</CardTitle>
                    {store.description && (
                      <CardDescription>{store.description}</CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
