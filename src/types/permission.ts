import { Role } from './role';

export interface Permission {
  id: string;
  permissionType: string;

  name: string;
  category: string;
  action: string;

  createdAt: string;
  updatedAt: string;
}
