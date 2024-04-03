import { Catalog } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class CatalogResponse {
  id: string;

  @Exclude()
  userId: string;

  name: string;
  vertical: string;
  promary: boolean;
  constructor(catalog: Catalog) {
    Object.assign(this, catalog);
  }
}
