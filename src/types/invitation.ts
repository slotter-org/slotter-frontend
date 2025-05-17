import { User } from "./user";
import { Wms } from "./wms";
import { Company } from "./company";

/**
 * Match back-end: 
 *   InvitationStatus = ["pending", "accepted", "canceled", "expired", "rejected"]
 */
export type InvitationStatus =
  | "pending"
  | "accepted"
  | "canceled"
  | "expired"
  | "rejected";

/**
 * Match back-end:
 *   InvitationType = ["join_wms", "join_wms_with_new_company", "join_company"]
 */
export type InvitationType =
  | "join_wms"
  | "join_wms_with_new_company"
  | "join_company";

/**
 * Front-end Invitation interface,
 * mirrors your Go `types.Invitation` struct:
 */
export interface Invitation {
  id: string;
  inviteUserID?: string;
  inviteUser?: User;

  wmsID?: string;
  wms?: Wms;

  companyID?: string;
  company?: Company;

  name?: string;
  roleID?: string;

  token: string;
  invitationType: InvitationType;
  status: InvitationStatus;
  message?: string;
  email?: string;
  phoneNumber?: string;
  expiresAt?: string;
  avatarBucketKey?: string;
  avatarURL?: string;

  acceptedAt?: string;
  rejectedAt?: string;
  expiredAt?: string;
  canceledAt?: string;

  createdAt?: string;
  updatedAt?: string;
}
