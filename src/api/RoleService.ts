import axiosClient from "./axiosClient";
import type { Role } from "@/types/role";
import type { Permission } from "@/types/permission";


//---------------------------------------------------------------
// CREATE
//---------------------------------------------------------------

export interface CreateRoleRequest {
  name: string;
  description: string;
}

export interface CreateRoleResponse {
  message: string;
}

export async function createRole(req: CreateRoleRequest): Promise<CreateRoleResponse> {
  const response = await axiosClient.post("/role", req);
  return response.data;
}

//----------------------------------------------------------------
// UPDATE (name/description)
//----------------------------------------------------------------

export interface UpdateRoleNameDescRequest {
  role_id: string;
  name?: string;
  description?: string;
}

export interface UpdateRoleNameDescResponse {
  message: string;
}

export async function updateRoleNameDesc(req: UpdateRoleNameDescRequest): Promise<UpdateRoleNameDescResponse> {
  const response = await axiosClient.patch("/role", req);
  return response.data;
}

//------------------------------------------------------------------
// UPDATE (permissions)
//------------------------------------------------------------------

export interface UpdateRolePermissionsRequest {
  role_id: string;
  permissions: Permission[];
}

export interface UpdateRolePermissionsResponse {
  message: string;
}

export async function updateRolePermissions(req: UpdateRolePermissionsRequest): Promise<UpdateRolePermissionsResponse> {
  const response = await axiosClient.patch("/role/permissions", req);
  return response.data;
}

//------------------------------------------------------------------
// UPDATE (users)
//------------------------------------------------------------------

export interface UpdateRoleUsersRequest {
  role_id: string;
  users: User[];
}

export interface UpdateRoleUsersResponse {
  message: string;
}

export async function updateRoleUsers(req: UpdateRoleUsersRequest): Promise<UpdateRoleUsersResponse> {
  const response = await axiosClient.patch("/role/users", req);
  return response.data;
}

//-------------------------------------------------------------------
// DELETE
//-------------------------------------------------------------------

export interface DeleteRoleRequest {
  role_id: string;
}

export interface DeleteRoleResponse {
  message: string;
}

export async function deleteRole(req: DeleteRoleRequest): Promise<DeleteRoleResponse> {
  const response = await axiosClient.delete("/role", { data: req });
  return response.data;
}
