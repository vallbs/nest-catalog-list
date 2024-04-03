import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators';
import { CatalogService } from './catalog.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateCatalogDto } from './dto';

@Controller('catalogs')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createCatalogDto: CreateCatalogDto, @CurrentUser('sub') userId: string) {
    return this.catalogService.create(createCatalogDto, userId);
  }

  // @Get()
  // findAll() {
  //   return this.catalogService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.catalogService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCatalogDto: UpdateCatalogDto) {
  //   return this.catalogService.update(+id, updateCatalogDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.catalogService.remove(+id);
  // }
}
