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
    // Clean database respecting FKs
    await prisma.assetAttachment.deleteMany();
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
    await prisma.assetAttachment.deleteMany();
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

  describe('POST /assets/:id/attachments', () => {
    let attachmentAssetId: string;
    let attachmentId: string;

    beforeAll(async () => {
      // Ensure we have a fresh asset for attachment tests
      const createRes = await request(app.getHttpServer())
        .post('/assets')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'Asset for attachments',
          description: 'attachment test',
          type: 'REAL_ESTATE',
          value: 12345,
        })
        .expect(201);
      attachmentAssetId = createRes.body.id;
    });

    it('should upload an attachment for the asset owner (user1)', async () => {
      const res = await request(app.getHttpServer())
        .post(`/assets/${attachmentAssetId}/attachments`)
        .set('Authorization', `Bearer ${user1Token}`)
        .attach('file', Buffer.from('%PDF-1.4\n%âãÏÓ\n1 0 obj\n<< /Type /Catalog >>\nendobj'), { filename: 'test.pdf', contentType: 'application/pdf' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.assetId).toBe(attachmentAssetId);
      expect(res.body.fileName).toBe('test.pdf');
      expect(res.body.fileType).toBe('application/pdf');
      expect(typeof res.body.fileSize).toBe('number');
      expect(typeof res.body.filePath).toBe('string');
      attachmentId = res.body.id;
    });

    it('should return a signed download URL for the asset owner (user1)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/assets/${attachmentAssetId}/attachments/${attachmentId}/download-url`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(res.body).toHaveProperty('downloadUrl');
      expect(typeof res.body.downloadUrl).toBe('string');
      expect(res.body.downloadUrl).toContain('http');
    });

    it('should not return a download URL for a non-owner (user2)', async () => {
      await request(app.getHttpServer())
        .get(`/assets/${attachmentAssetId}/attachments/${attachmentId}/download-url`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(403);
    });

    it('should not return a download URL for an unauthenticated user', async () => {
      await request(app.getHttpServer())
        .get(`/assets/${attachmentAssetId}/attachments/${attachmentId}/download-url`)
        .expect(401);
    });

    it('should return 404 for a non-existent attachment', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .get(`/assets/${attachmentAssetId}/attachments/${fakeId}/download-url`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(404);
    });

    it('should reject a file that is too large', async () => {
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024, 0);
      await request(app.getHttpServer())
        .post(`/assets/${attachmentAssetId}/attachments`)
        .set('Authorization', `Bearer ${user1Token}`)
        .attach('file', largeBuffer, { filename: 'huge.pdf', contentType: 'application/pdf' })
        .expect(400);
    });

    it('should reject a file with an unsupported type', async () => {
      await request(app.getHttpServer())
        .post(`/assets/${attachmentAssetId}/attachments`)
        .set('Authorization', `Bearer ${user1Token}`)
        .attach('file', Buffer.from('invalid'), { filename: 'test.txt', contentType: 'text/plain' })
        .expect(400);
    });

    it("should not allow a non-owner (user2) to upload an attachment", async () => {
      await request(app.getHttpServer())
        .post(`/assets/${attachmentAssetId}/attachments`)
        .set('Authorization', `Bearer ${user2Token}`)
        .attach('file', Buffer.from('%PDF-1.4\n'), { filename: 'test.pdf', contentType: 'application/pdf' })
        .expect(403);
    });

    it('should not allow an unauthenticated user to upload an attachment', async () => {
      await request(app.getHttpServer())
        .post(`/assets/${attachmentAssetId}/attachments`)
        .attach('file', Buffer.from('test pdf data'), 'test.pdf')
        .expect(401);
    });

    it('should not allow a non-owner (user2) to delete an attachment', async () => {
      await request(app.getHttpServer())
        .delete(`/assets/${attachmentAssetId}/attachments/${attachmentId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(403);
    });

    it('should not allow an unauthenticated user to delete an attachment', async () => {
      await request(app.getHttpServer())
        .delete(`/assets/${attachmentAssetId}/attachments/${attachmentId}`)
        .expect(401);
    });

    it('should delete an attachment for the asset owner (user1)', async () => {
      await request(app.getHttpServer())
        .delete(`/assets/${attachmentAssetId}/attachments/${attachmentId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(204);
    });

    it('should return 404 when trying to delete an already deleted attachment', async () => {
      await request(app.getHttpServer())
        .delete(`/assets/${attachmentAssetId}/attachments/${attachmentId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(404);
    });
  });
});


