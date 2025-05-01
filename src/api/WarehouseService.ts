import axiosClient from './axiosClient'
import type { Warehouse } from '@/types/warehouse'

export interface NewWarehouseRequest {
  Name: string;
  CompanyID?: string;
}

export interface NewWarehouseResponse {
  "success": bool;
  "warehouse": Warehouse;
}

export async function NewWarehouse(request: NewWarehouseRequest): Promise<NewWarehouseResponse> {
  const response = await axiosClient.post("/warehouse", request);
  return response.data;
}
