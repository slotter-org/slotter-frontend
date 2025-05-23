import axiosClient from './axiosClient'
import type { Wms } from '@/types/wms'
import type { User } from '@/types/user'
import type { Role } from '@/types/role'
import type { Company } from '@/types/company'
import type { Invitation } from '@/types/invitation'
import type { Permission } from '@/types/permission'

export interface GetMyWmsResponse {
  myWms: Wms
}

export interface GetMyWmsUsersResponse {
  myUsers: User[]
}

export interface GetMyWmsRolesResponse {
  myRoles: Role[]
}

export interface GetMyWmsCompaniesResponse {
  myCompanies: Company[]
}

export interface GetMyWmsInvitationsResponse {
  myInvitations: Invitation[]
}

export interface GetMyWmsPermissionsResponse {
  myPermissions: Permission[]
}

export async function getMyWms(): Promise<GetMyWmsResponse> {
  const resp = await axiosClient.get<GetMyWmsResponse>('/mywms')
  return resp.data
}

export async function getMyWmsUsers(): Promise<GetMyWmsUsersResponse> {
  const resp = await axiosClient.get<GetMyWmsUsersResponse>('/mywms/users')
  return resp.data
}

export async function getMyWmsRoles(): Promise<GetMyWmsRolesResponse> {
  const resp = await axiosClient.get<GetMyWmsRolesResponse>('/mywms/roles')
  return resp.data
}

export async function getMyWmsCompanies(): Promise<GetMyWmsCompaniesResponse> {
  const resp = await axiosClient.get<GetMyWmsCompaniesResponse>('/mywms/companies')
  return resp.data
}

export async function getMyWmsInvitations(): Promise<GetMyWmsInvitationsResponse> {
  const resp = await axiosClient.get<GetMyWmsInvitationsResponse>('/mywms/invitations')
  return resp.data
}

export async function getMyWmsPermissions(): Promise<GetMyWmsPermissionsResponse> {
  const resp = await axiosClient.get<GetMyWmsPermissionsResponse>('/mywms/permissions')
  return resp.data
}
