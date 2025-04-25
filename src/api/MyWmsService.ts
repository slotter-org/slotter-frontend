import axiosClient from './axiosClient'
import type { Wms } from '@/types/wms'
import type { User } from '@/types/user'
import type { Role } from '@/types/role'
import type { Company } from '@/types/company'

export interface GetMyWmsResponse {
  myWms: Wms
}

export interface GetMyWmsUsersResponse {
  users: User[]
}

export interface GetMyWmsRolesResponse {
  roles: Role[]
}

export interface GetMyWmsCompaniesResponse {
  companies: Company[]
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

