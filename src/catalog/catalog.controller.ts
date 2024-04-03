import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators';
import { CatalogService } from './catalog.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateCatalogDto, DeleteBulkDto, UpdateCatalogDto } from './dto';
import { CatalogResponse } from './responses';

@Controller('catalogs')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createCatalogDto: CreateCatalogDto, @CurrentUser('sub') userId: string) {
    try {
      const createdCatalog = await this.catalogService.create(createCatalogDto, userId);

      if (!createdCatalog) {
        throw new InternalServerErrorException('Could not create the catalog');
      }

      return new CatalogResponse(createdCatalog);
    } catch (err: any) {
      throw new InternalServerErrorException('Could not create the catalog');
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(@CurrentUser('sub') userId: string) {
    try {
      const catalogs = await this.catalogService.findAll(userId);

      if (catalogs?.length) {
        return catalogs.map((catalog) => new CatalogResponse(catalog));
      }

      return catalogs;
    } catch (err: any) {
      throw new InternalServerErrorException(`Could not get the user's catalogs`);
    }
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.catalogService.findOne(+id);
  // }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async update(
    @Param('id') catalogId: string,
    @CurrentUser('sub') userId: string,
    @Body() updateCatalogDto: UpdateCatalogDto,
  ) {
    try {
      const updatedCatalog = await this.catalogService.updateById(catalogId, userId, updateCatalogDto);

      return new CatalogResponse(updatedCatalog);
    } catch (err: any) {
      if (err instanceof NotFoundException || err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException(`Could not update the catalog`);
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  delete(@Param('id') catalogId: string, @CurrentUser('sub') userId: string) {
    return this.catalogService.delete(catalogId, userId);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  deleteBulk(@Body() deleteBulkDto: DeleteBulkDto, @CurrentUser('sub') userId: string) {
    return this.catalogService.deleteMany(deleteBulkDto.ids, userId);
  }
}
