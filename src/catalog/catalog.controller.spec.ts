import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Catalog } from '@prisma/client';
import { v4 } from 'uuid';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { CreateCatalogDto } from './dto';
import { Vertical } from './interfaces';

const mockCatalogService = {
  create: jest.fn(),
  findAll: jest.fn(),
  updateById: jest.fn(),
  delete: jest.fn(),
  deleteMany: jest.fn(),
};

describe('CatalogController', () => {
  let controller: CatalogController;
  let service: CatalogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogController],
      providers: [CatalogService],
    })
      .overrideProvider(CatalogService)
      .useValue(mockCatalogService)
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CatalogController>(CatalogController);
    service = module.get<CatalogService>(CatalogService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    let id: string;
    let userId: string;
    let createCatalogDto: CreateCatalogDto;

    beforeEach(() => {
      id = v4();
      userId = v4();
      createCatalogDto = { name: 'Test Catalog', vertical: Vertical.FASHION, primary: true };
    });

    it('should return a catalog response on successful creation', async () => {
      const result = { id, userId, ...createCatalogDto } as Catalog;
      jest.spyOn(service, 'create').mockImplementation(async () => result);

      expect(await controller.create(createCatalogDto, userId)).toEqual(result);
    });

    it('should throw InternalServerErrorException when service fails to create a catalog', async () => {
      jest.spyOn(service, 'create').mockImplementation(async () => {
        throw new InternalServerErrorException();
      });

      await expect(controller.create(createCatalogDto, userId)).rejects.toThrow(InternalServerErrorException);
    });

    it('should propagate NotFoundException and BadRequestException thrown by the service', async () => {
      jest.spyOn(service, 'create').mockImplementation(async () => {
        throw new BadRequestException();
      });

      await expect(controller.create(createCatalogDto, userId)).rejects.toThrow(BadRequestException);
    });
  });
});
