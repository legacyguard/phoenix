import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Guardians (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const user1 = { email: `guard_user1_${Date.now()}@e2e.test`, password: 'password123' };
  const user2 = { email: `guard_user2_${Date.now()}@e2e.test`, password: 'password123' };

  let user1Token: string;
  let user2Token: string;
  let guardianId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.guardian.deleteMany();
    await prisma.userSettings.deleteMany();
    await prisma.user.deleteMany();

    await request(app.getHttpServer()).post('/auth/register').send(user1).then(() => void 0).catch(() => void 0);
    await request(app.getHttpServer()).post('/auth/register').send(user2).then(() => void 0).catch(() => void 0);

    const login1 = await request(app.getHttpServer()).post('/auth/login').send(user1).expect(200);
    user1Token = login1.body.accessToken;
    const login2 = await request(app.getHttpServer()).post('/auth/login').send(user2).expect(200);
    user2Token = login2.body.accessToken;
  });

  afterAll(async () => {
    await prisma.guardian.deleteMany();
    await prisma.userSettings.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('/guardians CRUD & AuthZ', () => {
    const validGuardian = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+421900000000',
      relationship: 'Friend',
    };

    it('POST /guardians - should reject without authentication', async () => {
      await request(app.getHttpServer()).post('/guardians').send(validGuardian).expect(401);
    });

    it('POST /guardians - should reject invalid data', async () => {
      await request(app.getHttpServer())
        .post('/guardians')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ firstName: '', lastName: '', email: 'not-an-email', relationship: '' })
        .expect(400);
    });

    it('POST /guardians - should create a guardian for user1', async () => {
      const res = await request(app.getHttpServer())
        .post('/guardians')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(validGuardian)
        .expect(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe(validGuardian.email);
      guardianId = res.body.id;
    });

    it('POST /guardians - should not allow duplicate email for same user', async () => {
      await request(app.getHttpServer())
        .post('/guardians')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(validGuardian)
        .expect(409);
    });

    it('GET /guardians - should get all guardians for user1', async () => {
      const res = await request(app.getHttpServer())
        .get('/guardians')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].id).toBe(guardianId);
    });

    it('GET /guardians - should get empty array for user2', async () => {
      const res = await request(app.getHttpServer())
        .get('/guardians')
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('GET /guardians/:id - should get one guardian by id for user1', async () => {
      const res = await request(app.getHttpServer())
        .get(`/guardians/${guardianId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);
      expect(res.body.id).toBe(guardianId);
    });

    it("GET /guardians/:id - should not get user1's guardian for user2", async () => {
      await request(app.getHttpServer())
        .get(`/guardians/${guardianId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(404);
    });

    it("PATCH /guardians/:id - should not update user1's guardian for user2", async () => {
      await request(app.getHttpServer())
        .patch(`/guardians/${guardianId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ relationship: 'Hacker' })
        .expect(404);
    });

    it('PATCH /guardians/:id - should update a guardian for user1', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/guardians/${guardianId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ relationship: 'Best Friend' })
        .expect(200);
      expect(res.body.relationship).toBe('Best Friend');
    });

    it("DELETE /guardians/:id - should not delete user1's guardian for user2", async () => {
      await request(app.getHttpServer())
        .delete(`/guardians/${guardianId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(404);
    });

    it('DELETE /guardians/:id - should delete a guardian for user1', async () => {
      await request(app.getHttpServer())
        .delete(`/guardians/${guardianId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(204);
    });

    it('GET /guardians/:id - should return 404 when getting a deleted guardian', async () => {
      await request(app.getHttpServer())
        .get(`/guardians/${guardianId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(404);
    });
  });
});


