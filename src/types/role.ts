import { User } from './user';
import { Permission } from './permission';
import { Wms } from './wms';
import { Company } from './company';

export interface Role {
  id: string;
  wmsID?: string;
  wms?: Wms;
  companyID?: string;
  company?: Company;
  users?: User[];
  permissions?: Permission[];

  name: string;

  createdAt: string;
  updatedAt: string;
}
