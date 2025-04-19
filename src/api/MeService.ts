import axiosClient from './axiosClient';
import type { User } from '@/types/user';
import type { Company } from '@/types/company';
import type { Wms } from '@/types/wms';
import type { Role } from '@/types/role';

export interface GetMeResponse {
  me: User;
}

export interface GetMyWmsResponse {
  myWms: Wms;
}

export interface GetMyCompanyResponse {
  myCompany: Company;
}

export interface GetMyRoleResponse {
  myRole: Role;
}

export async function getMe(): Promise<GetMeResponse> {
  const resp = await axiosClient.get<GetMeResponse>('/me');
  return resp.data;
}

export async function getMyWms(): Promise<GetMyWmsResponse> {
  const resp = await axiosClient.get<GetMyWmsResponse>('/mywms');
  return resp.data;
}

export async function getMyCompany(): Promise<GetMyCompanyResponse> {
  const resp = await axiosClient.get<GetMyCompanyResponse>('/mycompany');
  return resp.data;
}

export async function getMyRole(): Promise<GetMyRoleResponse> {
  const resp = await axiosClient.get<GetMyRoleResponse>('/myroles');
  return resp.data;
}

