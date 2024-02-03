import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
import { EditDto } from 'src/user/dto';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';

const randomNumber = Math.ceil(Math.random() * 9999999999);

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();
    await app.listen(4000);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:4000');
  });

  afterAll(() => app.close());

  describe('Auth', () => {
    const authDto: AuthDto = {
      firstName: 'Ali',
      lastName: 'Veli',
      email: `${randomNumber}@mail.com`,
      password: 'password123WD*!',
    };
    describe('SignUp', () => {
      const url = '/auth/signup';
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post(url)
          .withBody({
            password: authDto.password,
          })
          .expectStatus(400);
      });

      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post(url)
          .withBody({
            email: authDto.email,
          })
          .expectStatus(400);
      });

      it('should throw if no body provided', () => {
        return pactum.spec().post(url).expectStatus(400);
      });

      it('should sign up', () => {
        return pactum.spec().post(url).withBody(authDto).expectStatus(201);
      });
    });

    describe('SignIn', () => {
      const url = '/auth/signin';
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post(url)
          .withBody({
            password: authDto.password,
          })
          .expectStatus(400);
      });

      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post(url)
          .withBody({
            email: authDto.email,
          })
          .expectStatus(400);
      });

      it('should throw if no body provided', () => {
        return pactum.spec().post(url).expectStatus(400);
      });

      it('should sign in', () => {
        return pactum
          .spec()
          .post(url)
          .withBody(authDto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      const url = '/users/me';
      it('should get current user', () => {
        return pactum
          .spec()
          .get(url)
          .withBearerToken('$S{userAt}')
          .expectStatus(200);
      });
    });

    describe('Edit user', () => {
      const url = '/users';
      const dto: EditDto = {
        email: 'mail@mail.com',
        firstName: 'Cuma',
      };
      it('should edit user', () => {
        return pactum
          .spec()
          .patch(url)
          .withBearerToken('$S{userAt}')
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.email)
          .expectBodyContains(dto.firstName);
      });
    });
  });

  describe('Bookmarks', () => {
    const url = '/bookmarks';
    describe('Get empty bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get(url)
          .withBearerToken('$S{userAt}')
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('Create bookmarks', () => {
      const bookmarkDto: CreateBookmarkDto = {
        title: 'Nest.JS',
        link: 'https://nestjs.com/',
        description: 'Hello, nest!',
      };

      it('should create bookmark', () => {
        return pactum
          .spec()
          .post(url)
          .withBearerToken('$S{userAt}')
          .withBody(bookmarkDto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get(url)
          .withBearerToken('$S{userAt}')
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get(`${url}/$S{bookmarkId}`)
          .withBearerToken('$S{userAt}')
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      });
    });

    describe('Edit bookmark', () => {
      const bookmarkDto: EditBookmarkDto = {
        link: 'https://docs.nestjs.com/',
      };
      it('should edit bookmark by id', () => {
        return pactum
          .spec()
          .patch(`${url}/$S{bookmarkId}`)
          .withBearerToken('$S{userAt}')
          .withBody(bookmarkDto)
          .expectBodyContains(bookmarkDto.link)
          .expectStatus(200);
      });
    });

    describe('Delete bookmarks', () => {
      it('should delete bookmark by id', () => {
        return pactum
          .spec()
          .delete(`${url}/$S{bookmarkId}`)
          .withBearerToken('$S{userAt}')
          .expectStatus(204);
      });

      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get(url)
          .withBearerToken('$S{userAt}')
          .expectStatus(200)
          .expectBody([])
          .expectJsonLength(0);
      });
    });
  });
});
