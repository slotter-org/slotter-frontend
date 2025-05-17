import axiosClient from './axiosClient';
import type { Invitation, InvitationType } from '@/types/invitation';

export interface SendInvitationRequest {
  email?: string;
  phone_number?: string;
  invitation_type: InvitationType;
  name?: string;
  message?: string;
}

export interface SendInvitationResponse {
  message: string;
}

export async function sendInvitation(req: SendInvitationRequest): Promise<SendInvitationResponse> {
  const response = await axiosClient.post("/invitation", req);
  return response.data;
}

export interface UpdateInvitationMsgNameRequest {
  invitation_id: string;
  name?: string;
  message?: string;
}

export interface UpdateInvitationMsgNameResponse {
  message: string;
}

export async function updateInvitationMsgName(req: UpdateInvitationMsgNameRequest): Promise<UpdateInvitationMsgNameResponse> {
  const response = await axiosClient.patch("/invitation", req);
  return response.data;
}

export interface UpdateInvitationRoleRequest {
  invitation_id: string;
  role_id: string;
}

export interface UpdateInvitationRoleResponse {
  message: string;
}

export async function updateInvitationRole(req: UpdateInvitationRoleRequest): Promise<UpdateInvitationRoleResponse> {
  const response = await axiosClient.patch("/invitation/role", req);
  return response.data;
}

export interface CancelInvitationRequest {
  invitation_id: string;
}

export interface CancelInvitationResponse {
  message: string;
}

export async function cancelInvitation(req: CancelInvitationRequest): Promise<CancelInvitationResponse> {
  const response = await axiosClient.patch("/invitation/cancel", req);
  return response.data;
}

export interface ResendInvitationRequest {
  invitation_id: string;
}

export interface ResendInvitationResponse {
  message: string;
}

export async function resendInvitation(req: ResendInvitationRequest): Promise<ResendInvitationResponse> {
  const response = await axiosClient.patch("/invitation/resend", req);
  return response.data;
}

export interface DeleteInvitationRequest {
  invitation_id: string;
}

export interface DeleteInvitationResponse {
  message: string;
}

export async function deleteInvitation(req: DeleteInvitationRequest): Promise<DeleteInvitationResponse> {
  const response = await axiosClient.delete("/invitation", { data: req });
  return response.data;
}

export interface ValidateInvitationTokenRequest {
  token: string;
}

export interface ValidateInvitationTokenResponse {
  invitation: Invitation;
}

export async function validateInvitationToken(req: ValidateInvitationTokenRequest): Promise<ValidateInvitationTokenResponse> {
  const response = await axiosClient.post("/invitation/validtoken", req);
  return response.data
}

