import { Wms } from './wms';
import { Role } from './role';
import { User } from './user';

export interface Company {
  id: string;
  wmsID?: string;
  wms?: Wms;
  defaultRoleID?: string;
  defaultRole?: Role;
  users?: User[];

  name: string;
  avatarBucketKey: string;
  avatarURL: string;

  createdAt?: string;
  updatedAt?: string;
}


