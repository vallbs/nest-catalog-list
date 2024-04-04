import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CatalogRepository } from './catalog.repository';
import { CreateCatalogDto, UpdateCatalogDto, VALIDATION } from './dto';
import { IdsDistribution } from './interfaces';

@Injectable()
export class CatalogService {
  constructor(private readonly catalogRepository: CatalogRepository) {}

  async create(catalog: CreateCatalogDto, userId: string) {
    await this.checkNameIsUnique(catalog.name);

    const primary = catalog.primary ?? false;

    if (primary) {
      await this.checkOnePrimaryPerVertical(userId, catalog.vertical);
    }

    const catalogToCreate = {
      ...catalog,
      primary,
    };

    return this.catalogRepository.create(catalogToCreate, userId);
  }

  findAll(userId: string) {
    return this.catalogRepository.findAll(userId);
  }

  async updateById(catalogId: string, userId: string, updateCatalogDto: UpdateCatalogDto) {
    const existingCatalog = await this.checkUserCatalogExistence(catalogId, userId);

    const primary = updateCatalogDto.primary ?? false;

    if (primary) {
      await this.checkOnePrimaryPerVertical(userId, existingCatalog.vertical);
    }

    return this.catalogRepository.updateById(catalogId, userId, updateCatalogDto);
  }

  delete(catalogId: string, userId: string) {
    return this.catalogRepository.delete(catalogId, userId);
  }

  async deleteMany(catalogIds: string[], userId: string) {
    const { existingIds, missingIds } = await this.findIdsDistributionForDeletion(catalogIds, userId);

    await this.catalogRepository.deleteMany(existingIds, userId);

    return {
      deletedIds: existingIds,
      missingIds,
    };
  }

  private async checkNameIsUnique(name) {
    const existingCatalogForName = await this.catalogRepository.findUniqueByName(name);

    if (existingCatalogForName) {
      throw new BadRequestException(VALIDATION.NAME.ALREADY_EXISTS.replace('{name}', name));
    }
  }

  private async checkOnePrimaryPerVertical(userId: string, vertical: string) {
    const primaryCatalog = await this.catalogRepository.findFirstPrimaryCatalog(userId, vertical);

    if (primaryCatalog) {
      throw new ConflictException(VALIDATION.VERTICAL.SECOND_PRIMARY.replace('{vertical}', vertical));
    }
  }

  private async checkUserCatalogExistence(catalogId: string, userId: string) {
    const existingCatalog = await this.catalogRepository.findUniqueByIdAndUserId(catalogId, userId);

    if (!existingCatalog) {
      throw new NotFoundException(VALIDATION.CATALOG.DOES_NOT_EXISTS.replace('{catalogId}', catalogId));
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
    const existingCatalogIds = (await this.catalogRepository.findManyByIdsAndUserId(catalogIds, userId)) ?? [];
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
