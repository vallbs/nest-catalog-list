import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CatalogRepository } from './catalog.repository';
import { CreateCatalogDto } from './dto';
import { v4 } from 'uuid';
import { Vertical } from './interfaces';
import { Catalog } from '@prisma/client';

const mockCatalogRepository = (): jest.Mocked<Partial<CatalogRepository>> => ({
  create: jest.fn(),
  findUniqueByName: jest.fn(),
  findFirstPrimaryCatalog: jest.fn(),
});

describe('CatalogService', () => {
  let service: CatalogService;
  let repository: jest.Mocked<CatalogRepository>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [CatalogService, { provide: CatalogRepository, useFactory: mockCatalogRepository }],
    }).compile();

    service = module.get<CatalogService>(CatalogService);
    repository = module.get<CatalogRepository>(CatalogRepository) as jest.Mocked<CatalogRepository>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

    it('should successfully create a catalog', async () => {
      const result = { id, userId, ...createCatalogDto } as Catalog;

      repository.create.mockResolvedValue(result);

      expect(await service.create(createCatalogDto, userId)).toEqual(result);
      expect(repository.create).toHaveBeenCalledWith(createCatalogDto, userId);
    });

    it('should throw BadRequestException if catalog name is not unique', async () => {
      const result = { id, userId, ...createCatalogDto } as Catalog;

      repository.findUniqueByName.mockResolvedValue(result);

      await expect(service.create(createCatalogDto, userId)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if catalog is second primary within the same vertical', async () => {
      const result = { id, userId, ...createCatalogDto } as Catalog;

      repository.findFirstPrimaryCatalog.mockResolvedValue(result);

      await expect(service.create(createCatalogDto, userId)).rejects.toThrow(BadRequestException);
    });
  });
});
