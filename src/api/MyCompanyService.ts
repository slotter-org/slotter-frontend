import axiosClient from './axiosClient'
import type { Company } from '@/types/company'
import type { User } from '@/types/user'
import type { Role } from '@/types/role'
import type { Warehouse } from '@/types/warehouse'
import type { Invitation } from '@/types/invitation'
import type { Permission } from '@/types/permission'


export interface GetMyCompanyResponse {
  myCompany: Company
}

export interface GetMyCompanyUsersResponse {
  myUsers: User[]
}

export interface GetMyCompanyRolesResponse {
  myRoles: Role[]
}

export interface GetMyCompanyWarehousesResponse {
  myWarehouses: Warehouse[]
}

export interface GetMyCompanyInvitationsResponse {
  myInvitations: Invitation[]
}

export interface GetMyCompanyPermissionsResponse {
  myPermissions: Permission[]
}

export async function getMyCompany(): Promise<GetMyCompanyResponse> {
  const resp = await axiosClient.get<GetMyCompany>('/mycompany')
  return resp.data
}

export async function getMyCompanyUsers(): Promise<GetMyCompanyUsersResponse> {
  const resp = await axiosClient.get<GetMyCompanyUsersResponse>('/mycompany/users')
  return resp.data
}

export async function getMyCompanyRoles(): Promise<GetMyCompanyRolesResponse> {
  const resp = await axiosClient.get<GetMyCompanyRolesResponse>('/mycompany/roles')
  return resp.data
}

export async function getMyCompanyWarehouses(): Promise<GetMyCompanyWarehousesResponse> {
  const resp = await axiosClient.get<GetMyCompanyWarehousesResponse>('/mycompany/warehouses')
  return resp.data
}

export async function getMyCompanyInvitations(): Promise<GetMyCompanyInvitationsResponse> {
  const resp = await axiosClient.get<GetMyCompanyInvitationsResponse>('/mycompany/invitations')
  return resp.data
}

export async function getMyCompanyPermissions(): Promise<GetMyCompanyPermissionsResponse> {
  const resp = await axiosClient.get<GetMyCompanyPermissionsResponse>('/mycompany/permissions')
  return resp.data
}
