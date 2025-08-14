import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Assets (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const user1 = { email: `assets_user1_${Date.now()}@e2e.test`, password: 'password123' };
  const user2 = { email: `assets_user2_${Date.now()}@e2e.test`, password: 'password123' };

  let user1Token: string;
  let user2Token: string;
  let assetId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
    // Clean database (assets first due FK)
    await prisma.asset.deleteMany();
    await prisma.user.deleteMany();

    // Register users (ignore conflicts if already exist due to retries)
    await request(app.getHttpServer()).post('/auth/register').send(user1).then(() => void 0).catch(() => void 0);
    await request(app.getHttpServer()).post('/auth/register').send(user2).then(() => void 0).catch(() => void 0);

    // Login users and store tokens
    const login1 = await request(app.getHttpServer()).post('/auth/login').send(user1).expect(200);
    user1Token = login1.body.accessToken;

    const login2 = await request(app.getHttpServer()).post('/auth/login').send(user2).expect(200);
    user2Token = login2.body.accessToken;
  });

  afterAll(async () => {
    await prisma.asset.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('/assets CRUD & AuthZ', () => {
    const validAsset = {
      name: 'Byt v Bratislave',
      description: '3-izbový byt v centre',
      type: 'REAL_ESTATE',
      value: 250000,
    };

    it('POST /assets - should reject without authentication', async () => {
      await request(app.getHttpServer()).post('/assets').send(validAsset).expect(401);
    });

    it('POST /assets - should reject invalid data', async () => {
      await request(app.getHttpServer())
        .post('/assets')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ name: '', type: 'REAL_ESTATE', value: -100 })
        .expect(400);
    });

    it('POST /assets - should create an asset for user1', async () => {
      const res = await request(app.getHttpServer())
        .post('/assets')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(validAsset)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(validAsset.name);
      assetId = res.body.id;
    });

    it('GET /assets - should get all assets for user1', async () => {
      const res = await request(app.getHttpServer())
        .get('/assets')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].id).toBe(assetId);
    });

    it('GET /assets - should get an empty array for user2', async () => {
      const res = await request(app.getHttpServer())
        .get('/assets')
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('GET /assets/:id - should get one asset by id for user1', async () => {
      const res = await request(app.getHttpServer())
        .get(`/assets/${assetId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);
      expect(res.body.id).toBe(assetId);
    });

    it("GET /assets/:id - should not get user1's asset for user2", async () => {
      await request(app.getHttpServer())
        .get(`/assets/${assetId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(404);
    });

    it("PATCH /assets/:id - should not update user1's asset for user2", async () => {
      await request(app.getHttpServer())
        .patch(`/assets/${assetId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ name: 'Hacker name' })
        .expect(403);
    });

    it('PATCH /assets/:id - should update an asset for user1', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/assets/${assetId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ name: 'Byt v Starom Meste' })
        .expect(200);
      expect(res.body.name).toBe('Byt v Starom Meste');
    });

    it("DELETE /assets/:id - should not delete user1's asset for user2", async () => {
      await request(app.getHttpServer())
        .delete(`/assets/${assetId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(403);
    });

    it('DELETE /assets/:id - should delete an asset for user1', async () => {
      await request(app.getHttpServer())
        .delete(`/assets/${assetId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);
    });

    it('GET /assets/:id - should return 404 when getting a deleted asset', async () => {
      await request(app.getHttpServer())
        .get(`/assets/${assetId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(404);
    });
  });
});


