import { User } from './user';
import { Wms } from './wms';
import { Company } from './company';

export interface Invitation {
  id: string;
  inviteUserID?: string;
  inviteUser?: User;
  wmsID?: string;
  wms?: Wms;
  companyID?: string;
  company?: Company;

  token: string;
  invitationType: string;
  status: string;
  email?: string;
  phoneNumber?: string;
  expiresAt?: string;

  acceptedAt?: string;
  canceledAt?: string;

  createdAt?: string;
  updatedAt?: string;
}
