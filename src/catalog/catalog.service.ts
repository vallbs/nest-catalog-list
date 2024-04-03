import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCatalogDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';

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
}
