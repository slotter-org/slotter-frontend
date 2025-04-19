import axiosClient from './axiosClient';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  new_company_name?: string;
  new_wms_name?: string;
  company_id?: string;
  wms_id?: string;
}

export interface LoginRefreshResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export async function loginUser(creds: AuthCredentials): Promise<LoginRefreshResponse> {
  const response = await axiosClient.post("/login", creds);
  return response.data;
}

export async function registerUser(data: RegisterData) {
  const response = await axiosClient.post('/register', data);
  return response.data;
}

export async function refreshToken(): Promise<LoginRefreshResponse> {
  const response = await axiosClient.post('/refresh');
  return response.data;
}

export async function logoutUser() {
  const response = await axiosClient.post('/logout');
  return response.data
}
