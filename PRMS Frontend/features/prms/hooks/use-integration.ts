import { useQuery } from '@tanstack/react-query';
import { integrationApi } from '@/lib/prms-api';
import { queryKeys } from '@/lib/api';

export function useEmployee(employeeId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.integration.employee(employeeId ?? ''),
    queryFn: () => integrationApi.getEmployee(employeeId!),
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useInventoryCheck(itemCode: string | null | undefined, quantity?: number) {
  return useQuery({
    queryKey: queryKeys.integration.inventory(itemCode ?? ''),
    queryFn: () => integrationApi.checkInventory(itemCode!, quantity),
    enabled: !!itemCode,
    staleTime: 2 * 60 * 1000,
    retry: false,
  });
}

export function useInventoryItems() {
  return useQuery({
    queryKey: queryKeys.integration.inventoryItems,
    queryFn: () => integrationApi.listInventoryItems(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
