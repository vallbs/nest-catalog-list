import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { useContainer } from 'class-validator';
import { AppModule } from 'src/app.module';
import { VALIDATION } from 'src/catalog/dto';
import { Vertical } from 'src/catalog/interfaces';
import { PrismaService } from 'src/prisma/prisma.service';
import * as request from 'supertest';
import { v4 } from 'uuid';

describe('CatalogController (e2e)', () => {
  let prismaService: PrismaService;
  let app: INestApplication;
  let accessToken: string;
  let createdUsers: any[];
  let currentUser: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    const usersToCreate = [
      {
        email: 'test1@gmail.com',
        userName: 'test1',
        password: '123456',
        repeatPassword: '123456',
      },
      {
        email: 'test2@gmail.com',
        userName: 'test2',
        password: '123456',
        repeatPassword: '123456',
      },
    ];
    const createdUserResponses = await Promise.all([
      request(app.getHttpServer()).post('/auth/signup').send(usersToCreate[0]),
      request(app.getHttpServer()).post('/auth/signup').send(usersToCreate[1]),
    ]);
    createdUsers = createdUserResponses.map(({ body }) => body.result);
    currentUser = { ...createdUsers[0], password: usersToCreate[0].password };
    const sigInResponse = await request(app.getHttpServer()).post('/auth/signin').send({
      email: currentUser.email,
      password: currentUser.password,
    });
    accessToken = sigInResponse.body.accessToken;
  });

  beforeEach(async () => {
    await prismaService.catalog.deleteMany();
  });

  afterAll(async () => {
    await prismaService.user.deleteMany();
    await app.close();
  });

  afterEach(async () => {
    await prismaService.catalog.deleteMany();
  });

  describe('create catalog', () => {
    it('should throw Unauthorized for not provided token in request', async () => {
      const response = await request(app.getHttpServer()).post('/catalogs').send({
        name: 'test',
        vertical: Vertical.FASHION,
        primary: true,
      });
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should create a catalog for the current user', async () => {
      const response = await request(app.getHttpServer())
        .post('/catalogs')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'test',
          vertical: Vertical.FASHION,
          primary: true,
        });

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body.result?.userId).toEqual(currentUser.id);
    });

    it(`should create a catalog with missing primary defaulted to 'false'`, async () => {
      const response = await request(app.getHttpServer())
        .post('/catalogs')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'test',
          vertical: Vertical.FASHION,
        });

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body.result?.primary).toBe(false);
    });

    it('should fail to create a catalog with missing name', async () => {
      const response = await request(app.getHttpServer())
        .post('/catalogs')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          vertical: Vertical.FASHION,
          primary: true,
        });

      const message = getMessageFromResponse(response);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(message).toContain(VALIDATION.NAME.ONLY_LETTERS);
      expect(message).toContain(VALIDATION.NAME.STRING);
      expect(message).toContain(VALIDATION.NAME.NOT_EMPTY);
    });

    it('should fail to create a catalog with a duplicate name', async () => {
      const name = 'test';

      await request(app.getHttpServer()).post('/catalogs').set('Authorization', `Bearer ${accessToken}`).send({
        name,
        vertical: Vertical.FASHION,
        primary: true,
      });

      const response = await request(app.getHttpServer())
        .post('/catalogs')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name,
          vertical: Vertical.FASHION,
          primary: false,
        });

      const message = getMessageFromResponse(response);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(message).toContain(VALIDATION.NAME.ALREADY_EXISTS.replace('{name}', name));
    });

    it('should fail on an invalid vertical', async () => {
      const response = await request(app.getHttpServer())
        .post('/catalogs')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'test',
          vertical: 'not_existing',
          primary: true,
        });

      const message = getMessageFromResponse(response);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(message).toContain(VALIDATION.VERTICAL.FROM_ENUM);
    });

    it(`should fail to create the second primary catalog within the same vertical`, async () => {
      const vertical = Vertical.FASHION;
      const primary = true;

      await request(app.getHttpServer()).post('/catalogs').set('Authorization', `Bearer ${accessToken}`).send({
        name: 'hats',
        vertical,
        primary,
      });

      const response = await request(app.getHttpServer())
        .post('/catalogs')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'shoes',
          vertical,
          primary,
        });

      const message = getMessageFromResponse(response);

      expect(response.status).toBe(HttpStatus.CONFLICT);
      expect(message).toContain(VALIDATION.VERTICAL.SECOND_PRIMARY.replace('{vertical}', vertical));
    });
  });

  describe('find all catalogs', () => {
    it('should throw Unauthorized for not provided token in request', async () => {
      const response = await request(app.getHttpServer()).get('/catalogs');
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should find all catalogs for the current user', async () => {
      // insert 3 different catalogs into the database:
      // 2 for the current user, 1 - for another
      const anotherUser = createdUsers[1];

      await Promise.all([
        prismaService.catalog.create({
          data: {
            name: 'hats',
            vertical: Vertical.FASHION,
            primary: true,
            userId: currentUser.id,
          },
        }),
        prismaService.catalog.create({
          data: {
            name: 'shoes',
            vertical: Vertical.FASHION,
            primary: false,
            userId: currentUser.id,
          },
        }),
        prismaService.catalog.create({
          data: {
            name: 'pants',
            vertical: Vertical.FASHION,
            primary: true,
            userId: anotherUser.id,
          },
        }),
      ]);

      const response = await request(app.getHttpServer())
        .get('/catalogs')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.result.length).toBe(2);
    });
  });

  describe('update catalog', () => {
    it('should throw Unauthorized for not provided token in request', async () => {
      const catalogId = v4();

      const response = await request(app.getHttpServer()).patch(`/catalogs/${catalogId}`);
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it(`should successfully update the catalog for the current user (only 'primary' field)`, async () => {
      const catalog = await prismaService.catalog.create({
        data: {
          name: 'hats',
          vertical: Vertical.FASHION,
          primary: true,
          userId: currentUser.id,
        },
      });

      const payloadToUpdate = {
        name: 'tables',
        vertical: Vertical.HOME,
        primary: false,
      };

      const response = await request(app.getHttpServer())
        .patch(`/catalogs/${catalog.id}`)
        .send(payloadToUpdate)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.result).toEqual({
        id: catalog.id,
        name: catalog.name,
        vertical: catalog.vertical,
        primary: payloadToUpdate.primary,
      });
    });

    it(`should fail on update of non-existing catalog`, async () => {
      await prismaService.catalog.create({
        data: {
          name: 'hats',
          vertical: Vertical.FASHION,
          primary: true,
          userId: currentUser.id,
        },
      });

      const payloadToUpdate = {
        name: 'tables',
        vertical: Vertical.HOME,
        primary: false,
      };
      const notExistingCatalogId = v4();

      const response = await request(app.getHttpServer())
        .patch(`/catalogs/${notExistingCatalogId}`)
        .send(payloadToUpdate)
        .set('Authorization', `Bearer ${accessToken}`);

      const message = getMessageFromResponse(response);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(message).toContain(VALIDATION.CATALOG.DOES_NOT_EXISTS.replace('{catalogId}', notExistingCatalogId));
    });

    it(`should fail on update of existing catalog as the second primary within the same vertical`, async () => {
      const createdCatalogs = await Promise.all([
        prismaService.catalog.create({
          data: {
            name: 'hats',
            vertical: Vertical.FASHION,
            primary: false,
            userId: currentUser.id,
          },
        }),
        prismaService.catalog.create({
          data: {
            name: 'shoes',
            vertical: Vertical.FASHION,
            primary: true,
            userId: currentUser.id,
          },
        }),
      ]);

      const catalogToUpdate = createdCatalogs[0];

      const response = await request(app.getHttpServer())
        .patch(`/catalogs/${catalogToUpdate.id}`)
        .send({ primary: true })
        .set('Authorization', `Bearer ${accessToken}`);

      const message = getMessageFromResponse(response);

      expect(response.status).toBe(HttpStatus.CONFLICT);
      expect(message).toContain(VALIDATION.VERTICAL.SECOND_PRIMARY.replace('{vertical}', catalogToUpdate.vertical));
    });
  });

  describe('delete catalog', () => {
    it('should throw Unauthorized for not provided token in request', async () => {
      const catalogId = v4();

      const response = await request(app.getHttpServer()).delete(`/catalogs/${catalogId}`);
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should successfully delete the existing catalog for the current user', async () => {
      const catalog = await prismaService.catalog.create({
        data: {
          name: 'hats',
          vertical: Vertical.FASHION,
          primary: true,
          userId: currentUser.id,
        },
      });

      const { status } = await request(app.getHttpServer())
        .delete(`/catalogs/${catalog.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(status).toBe(HttpStatus.OK);
      const records = await prismaService.catalog.findUnique({ where: { id: catalog.id } });
      expect(records).toBeNull();
    });

    it('should fail on delete of non-existing catalog', async () => {
      await prismaService.catalog.create({
        data: {
          name: 'hats',
          vertical: Vertical.FASHION,
          primary: true,
          userId: currentUser.id,
        },
      });

      const notExistingCatalogId = v4();

      const response = await request(app.getHttpServer())
        .delete(`/catalogs/${notExistingCatalogId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain(
        VALIDATION.CATALOG.DOES_NOT_EXISTS.replace('{catalogId}', notExistingCatalogId),
      );
    });
  });

  describe('delete catalogs in bulk', () => {
    it('should throw Unauthorized for not provided token in request', async () => {
      const ids = [v4(), v4()];

      const response = await request(app.getHttpServer()).delete(`/catalogs`).send({ ids });
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should delete only existing catalogs for the current user', async () => {
      const anotherUser = createdUsers[1];

      const createdCatalogs = await Promise.all([
        prismaService.catalog.create({
          data: {
            name: 'hats',
            vertical: Vertical.FASHION,
            primary: true,
            userId: currentUser.id,
          },
        }),
        prismaService.catalog.create({
          data: {
            name: 'shoes',
            vertical: Vertical.FASHION,
            primary: false,
            userId: currentUser.id,
          },
        }),
        prismaService.catalog.create({
          data: {
            name: 'pants',
            vertical: Vertical.FASHION,
            primary: true,
            userId: anotherUser.id,
          },
        }),
      ]);

      const currentUserCatalogsIds = createdCatalogs
        .filter((catalog) => catalog.userId === currentUser.id)
        .map((catalog) => catalog.id);
      const anotherUserCatalogsIds = createdCatalogs
        .filter((catalog) => catalog.userId === anotherUser.id)
        .map((catalog) => catalog.id);
      const notExistingCatalogsIds = [v4(), v4()];
      const ids = [...currentUserCatalogsIds, ...anotherUserCatalogsIds, ...notExistingCatalogsIds];

      const response = await request(app.getHttpServer())
        .delete(`/catalogs`)
        .send({ ids })
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.result.deletedIds).toEqual(currentUserCatalogsIds);
      expect(response.body.result.missingIds).toEqual([...anotherUserCatalogsIds, ...notExistingCatalogsIds]);

      const records = await prismaService.catalog.findMany({});
      expect(records.length).toBe(anotherUserCatalogsIds.length);
    });
  });
});

function getMessageFromResponse(response) {
  return response.body?.result?.response?.message;
}
