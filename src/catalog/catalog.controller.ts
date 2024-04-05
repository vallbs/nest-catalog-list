import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators';
import { CatalogService } from './catalog.service';
import { CreateCatalogDto, DeleteBulkDto, UpdateCatalogDto } from './dto';
import { CatalogResponse } from './responses';

@Controller('catalogs')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createCatalogDto: CreateCatalogDto, @CurrentUser('sub') userId: string) {
    const createdCatalog = await this.catalogService.create(createCatalogDto, userId);

    if (!createdCatalog) {
      throw new InternalServerErrorException('Could not create the catalog');
    }

    return new CatalogResponse(createdCatalog);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(@CurrentUser('sub') userId: string) {
    const catalogs = await this.catalogService.findAll(userId);

    if (catalogs?.length) {
      return catalogs.map((catalog) => new CatalogResponse(catalog));
    }

    return catalogs;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async update(
    @Param('id') catalogId: string,
    @CurrentUser('sub') userId: string,
    @Body() updateCatalogDto: UpdateCatalogDto,
  ) {
    const updatedCatalog = await this.catalogService.updateById(catalogId, userId, updateCatalogDto);

    return new CatalogResponse(updatedCatalog);
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
