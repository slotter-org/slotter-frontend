import { Company } from './company'

export interface Warehouse {
  id: string;
  companyID?: string;
  company?: Company;

  name?: string;
  avatarBucketKey?: string;
  avatarURL?: string;

  createdAt?: string;
  updatedAt?: string;
}
