import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCatalogDto, DeleteBulkDto, UpdateCatalogDto } from './dto';
import { CatalogResponse } from './responses';
import { Response } from 'express';
import { CurrentUser } from '../common/decorators';

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
      if (err instanceof NotFoundException || err instanceof BadRequestException) {
        throw err;
      }
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
      if (err instanceof BadRequestException) {
        throw err;
      }
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
  async deleteBulk(@Body() deleteBulkDto: DeleteBulkDto, @CurrentUser('sub') userId: string, @Res() res: Response) {
    const result = await this.catalogService.deleteMany(deleteBulkDto.ids, userId);

    const response = {
      ...result,
      message: 'Bulk deletion successful',
    };

    res.status(HttpStatus.OK).json(response);
  }
}
