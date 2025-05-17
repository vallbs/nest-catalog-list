import { ApiProperty } from '@nestjs/swagger';
import { CatalogResponse } from './catalog.response';

export class CatalogListResponse {
  @ApiProperty({
    description: 'Array of catalogs',
    type: [CatalogResponse],
  })
  data: CatalogResponse[];

  constructor(catalogs: CatalogResponse[]) {
    this.data = catalogs;
  }
}
