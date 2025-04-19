import { Wms } from './wms';
import { Company } from './company';
import { Role } from './role';

export interface User {
  id: string;
  userType: string;
  wmsID?: string;
  wms?: Wms;
  companyID?: string;
  company?: Company;
  roleID?: string;
  role?: Role;

  email: string;
  phoneNumber?: string;
  firstName: string;
  lastName: string;
  avatarBucketKey?: string;
  avatarURL?: string;

  createdAt?: string;
  updatedAt?: string;
}
