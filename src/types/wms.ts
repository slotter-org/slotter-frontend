import { Role } from './role';
import { Company } from './company';
import { User } from './user';

export interface Wms {
  id: string;
  defaultRoleID?: string;
  defaultRole?: Role;
  companies?: Company[];
  users?: User[];

  name: string;
  avatarBucketKey?: string;
  avatarURL?: string;

  createdAt?: string;
  updatedAt?: string;
}
