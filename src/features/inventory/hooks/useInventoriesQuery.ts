import { useQuery } from "@tanstack/react-query";
import { inventoryApi, type GetInventoriesQuery } from "../api/inventoryApi";

const INVENTORIES_QUERY_KEY = "inventories";

export const useInventoriesQuery = (query?: GetInventoriesQuery) => {
  return useQuery({
    queryKey: [INVENTORIES_QUERY_KEY, query],
    queryFn: () => inventoryApi.getInventories(query),
    staleTime: 1000 * 60 * 5,
  });
};