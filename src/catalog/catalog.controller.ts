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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators';
import { CatalogService } from './catalog.service';
import { CreateCatalogDto, DeleteBulkDto, UpdateCatalogDto } from './dto';
import { CatalogErrorResponse, CatalogListResponse, CatalogResponse } from './responses';

@ApiTags('Catalog')
@ApiBearerAuth()
@Controller('catalogs')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new catalog' })
  @ApiResponse({ status: 201, description: 'The catalog has been successfully created.', type: CatalogResponse })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
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
  @ApiOperation({ summary: 'Get all catalogs for the current user' })
  @ApiResponse({ status: 200, description: 'List of catalogs.', type: CatalogListResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized.', type: CatalogErrorResponse })
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
  @ApiOperation({ summary: 'Update a catalog' })
  @ApiParam({ name: 'id', description: 'Catalog ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'The catalog has been successfully updated.', type: CatalogResponse })
  @ApiResponse({ status: 400, description: 'Invalid input data.', type: CatalogErrorResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized.', type: CatalogErrorResponse })
  @ApiResponse({ status: 404, description: 'Catalog not found.', type: CatalogErrorResponse })
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
  @ApiOperation({ summary: 'Delete a catalog' })
  @ApiParam({ name: 'id', description: 'Catalog ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'The catalog has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.', type: CatalogErrorResponse })
  @ApiResponse({ status: 404, description: 'Catalog not found.', type: CatalogErrorResponse })
  delete(@Param('id') catalogId: string, @CurrentUser('sub') userId: string) {
    return this.catalogService.delete(catalogId, userId);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete multiple catalogs' })
  @ApiResponse({ status: 200, description: 'The catalogs have been successfully deleted.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  deleteBulk(@Body() deleteBulkDto: DeleteBulkDto, @CurrentUser('sub') userId: string) {
    return this.catalogService.deleteMany(deleteBulkDto.ids, userId);
  }
}
