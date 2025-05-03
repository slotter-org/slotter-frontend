import axiosClient from './axiosClient'
import type { Warehouse } from '@/types/warehouse'

export interface CreateWarehouseRequest {
  name: string;
  company_id: string;
}

export interface CreateWarehouseResponse {
  success: boolean;
  warehouse: Warehouse;
}

export async function CreateWarehouse(request: CreateWarehouseRequest): Promise<CreateWarehouseResponse> {
  const response = await axiosClient.post("/warehouse", request);
  return response.data;
}


