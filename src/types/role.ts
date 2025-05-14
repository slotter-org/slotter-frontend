import { User } from './user';
import { Permission } from './permission';
import { Wms } from './wms';
import { Company } from './company';

export interface Role {
  id: string;
  wmsID?: string;
  companyID?: string;
  permissions?: Permission[];

  name: string;
  avatarBucketKey?: string;
  avatarURL?: string;

  createdAt: string;
  updatedAt: string;
}
