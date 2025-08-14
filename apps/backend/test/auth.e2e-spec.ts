import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.assetAttachment.deleteMany();
    await prisma.asset.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.assetAttachment.deleteMany();
    await prisma.asset.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('/auth', () => {
    const testUser = {
      email: 'test@example.com',
      password: 'password123',
    };
    let accessToken: string;

    it('POST /auth/register - should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201)
        .then((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body.user.email).toEqual(testUser.email);
        });
    });

    it('POST /auth/login - should log in the user and return a token', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser)
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveProperty('accessToken');
          accessToken = res.body.accessToken;
        });
    });

    it('GET /auth/profile - should return user profile with a valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then((res) => {
          expect(res.body.email).toEqual(testUser.email);
        });
    });

    it('GET /auth/profile - should fail without a token', () => {
      return request(app.getHttpServer()).get('/auth/profile').expect(401);
    });
  });
});


