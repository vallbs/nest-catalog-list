import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCatalogDto, UpdateCatalogDto } from './dto';
import { IdsDistribution } from './interfaces';

@Injectable()
export class CatalogService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(catalog: CreateCatalogDto, userId: string) {
    await this.checkNameIsUnique(catalog.name);

    const primary = catalog.primary ?? false;

    if (primary) {
      await this.checkOnePrimaryPerVertical(userId, catalog.vertical);
    }

    const catalogToCreate = {
      ...catalog,
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
    const existingCatalog = await this.checkUserCatalogExistence(catalogId, userId);

    const primary = updateCatalogDto.primary ?? false;

    if (primary) {
      await this.checkOnePrimaryPerVertical(userId, existingCatalog.vertical);
    }

    return this.prismaService.catalog.update({
      where: { id: catalogId, userId },
      data: updateCatalogDto,
    });
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
    const existingCatalogForName = await this.prismaService.catalog.findUnique({ where: { name } });

    if (existingCatalogForName) {
      throw new BadRequestException(`A catalog with the name '${name}' already exists.`);
    }
  }

  private async checkOnePrimaryPerVertical(userId: string, vertical: string) {
    const primaryCatalog = await this.prismaService.catalog.findFirst({ where: { userId, vertical, primary: true } });

    if (primaryCatalog) {
      throw new BadRequestException(`A primary catalog already exists in the '${vertical}' vertical for this user.`);
    }
  }

  private async checkUserCatalogExistence(catalogId: string, userId: string) {
    const existingCatalog = await this.prismaService.catalog.findUnique({ where: { id: catalogId, userId } });

    if (!existingCatalog) {
      throw new NotFoundException(
        `Catalog with id '${catalogId}' does not exist or is not accessible by the current user.`,
      );
    }

    return existingCatalog;
  }

  /**
   * Finds the distribution of catalog IDs for deletion by separating them into existing and missing IDs.
   * This method is used to identify which catalogs can be deleted and which ones are not found in the database.
   *
   * @async
   * @param {string[]} catalogIds - An array of catalog IDs to be checked for existence.
   * @param {string} userId - The ID of the user who owns the catalogs. This is used to ensure that only catalogs owned by the user are considered.
   * @returns {Promise<IdsDistribution>} A Promise that resolves to an `IdsDistribution` object containing two arrays: `existingIds` and `missingIds`.
   * `existingIds` contains the IDs of catalogs that exist and can be deleted.
   * `missingIds` contains the IDs of catalogs that do not exist in the database and therefore cannot be deleted.
   */
  private async findIdsDistributionForDeletion(catalogIds: string[], userId: string): Promise<IdsDistribution> {
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
