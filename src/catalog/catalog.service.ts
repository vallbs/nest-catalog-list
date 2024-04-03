import { Injectable } from '@nestjs/common';
import { CreateCatalogDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prismaService: PrismaService) {}

  create(catalog: CreateCatalogDto, userId: string) {
    const catalogToCreate = {
      ...structuredClone(catalog),
      user: { connect: { id: userId } },
      primary: catalog.primary !== undefined ? catalog.primary : false,
    };

    return this.prismaService.catalog.create({ data: catalogToCreate });
  }

  // findAll() {
  //   return `This action returns all catalog`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} catalog`;
  // }

  // update(id: number, updateCatalogDto: UpdateCatalogDto) {
  //   return `This action updates a #${id} catalog`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} catalog`;
  // }
}
