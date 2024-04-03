import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCatalogDto, UpdateCatalogDto } from './dto';

@Injectable()
export class CatalogService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(catalog: CreateCatalogDto, userId: string) {
    await this.checkNameIsUnique(catalog.name);

    const primary = catalog.primary !== undefined ? catalog.primary : false;

    if (primary) {
      await this.checkOnePrimaryPerVertical(userId, catalog.vertical);
    }

    const catalogToCreate = {
      ...structuredClone(catalog),
      user: { connect: { id: userId } },
      primary,
    };

    return this.prismaService.catalog.create({ data: catalogToCreate });
  }

  findAll(userId: string) {
    return this.prismaService.catalog.findMany({ where: { userId } });
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} catalog`;
  // }

  async updateById(catalogId: string, userId: string, updateCatalogDto: UpdateCatalogDto) {
    await this.checkUserCatalogExistence(catalogId, userId);

    const primary = updateCatalogDto.primary !== undefined ? updateCatalogDto.primary : false;

    if (primary) {
      await this.checkOnePrimaryPerVertical(userId, updateCatalogDto.vertical);
    }

    const updatedCatalog = await this.prismaService.catalog.update({
      where: { id: catalogId, userId },
      data: updateCatalogDto,
    });

    return updatedCatalog;
  }

  delete(catalogId: string, userId: string) {
    return this.prismaService.catalog.delete({ where: { id: catalogId, userId } });
  }

  async deleteMany(catalogIds: string[], userId: string) {
    const { existingIds, missingIds } = await this.findIdsDistributionForDeletion(catalogIds, userId);

    await this.prismaService.catalog.deleteMany({ where: { id: { in: existingIds } } });

    return {
      deletedIds: existingIds,
      missingIds,
    };
  }

  private async checkNameIsUnique(name) {
    const exitingCatalogForName = await this.prismaService.catalog.findUnique({ where: { name } });

    if (exitingCatalogForName) {
      throw new BadRequestException(`catalog with the name '${name}' is already exists`);
    }
  }

  private async checkOnePrimaryPerVertical(userId: string, vertical: string) {
    const existingUserCatalogsPerVertical =
      (await this.prismaService.catalog.findMany({ where: { userId, vertical, primary: true } })) || [];

    if (existingUserCatalogsPerVertical.length) {
      throw new BadRequestException(`user may have only one primary catalog per vertical`);
    }
  }

  private async checkUserCatalogExistence(catalogId: string, userId: string) {
    const exitsingCatalog = await this.prismaService.catalog.findUnique({ where: { id: catalogId, userId } });

    if (!exitsingCatalog) {
      throw new NotFoundException(`catalog with id '${catalogId}' do not exist for the current user`);
    }
  }

  private async findIdsDistributionForDeletion(
    catalogIds: string[],
    userId: string,
  ): Promise<{ existingIds: string[]; missingIds: string[] }> {
    const existingCatalogIds =
      (await this.prismaService.catalog.findMany({
        where: { id: { in: catalogIds }, userId },
        select: { id: true },
      })) || [];
    const existingCatalogIdsInArray = existingCatalogIds.map(({ id }) => id);

    if (!existingCatalogIdsInArray.length) {
      return {
        existingIds: [],
        missingIds: catalogIds,
      };
    }

    const existingCatalogIdsInSet = new Set(existingCatalogIdsInArray);
    const missingIds = catalogIds.filter((id) => !existingCatalogIdsInSet.has(id));

    return {
      existingIds: existingCatalogIdsInArray,
      missingIds,
    };
  }
}
