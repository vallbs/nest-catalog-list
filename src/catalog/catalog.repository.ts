import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCatalogDto, UpdateCatalogDto } from './dto';

@Injectable()
export class CatalogRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(catalog: CreateCatalogDto, userId: string) {
    const catalogToCreate = {
      ...catalog,
      primary: catalog.primary,
      user: { connect: { id: userId } },
    };

    return this.prismaService.catalog.create({ data: catalogToCreate });
  }

  findAll(userId: string) {
    return this.prismaService.catalog.findMany({ where: { userId } });
  }

  async updateById(catalogId: string, userId: string, updateCatalogDto: UpdateCatalogDto) {
    return this.prismaService.catalog.update({
      where: { id: catalogId, userId },
      data: updateCatalogDto,
    });
  }

  delete(catalogId: string, userId: string) {
    return this.prismaService.catalog.delete({ where: { id: catalogId, userId } });
  }

  async deleteMany(catalogIds: string[], userId: string) {
    return this.prismaService.catalog.deleteMany({ where: { id: { in: catalogIds }, userId } });
  }

  async findUniqueByName(name: string) {
    return this.prismaService.catalog.findUnique({ where: { name } });
  }

  async findFirstPrimaryCatalog(userId: string, vertical: string) {
    return this.prismaService.catalog.findFirst({ where: { userId, vertical, primary: true } });
  }

  async findUniqueByIdAndUserId(catalogId: string, userId: string) {
    return this.prismaService.catalog.findUnique({ where: { id: catalogId, userId } });
  }

  async findManyByIdsAndUserId(catalogIds: string[], userId: string) {
    return this.prismaService.catalog.findMany({
      where: { id: { in: catalogIds }, userId },
      select: { id: true },
    });
  }
}
