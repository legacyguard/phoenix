import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

// Helper to extract token from auth responses if needed
async function registerAndLogin(app: INestApplication, email: string, password = 'Passw0rd!') {
  // Assuming there exist endpoints for auth: /auth/register and /auth/login
  await request(app.getHttpServer())
    .post('/auth/register')
    .send({ email, password })
    .expect(201);

  const res = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password })
    .expect(200);

  return res.body?.accessToken || res.body?.access_token || res.body?.token;
}

describe('Heartbeat Guardians E2E', () => {
  let app: INestApplication;
  let httpServer: any;
  let prisma: any;

  let user1Token: string;
  let user2Token: string;

  let guardian1Id: string;
  let guardian2Id: string;
  let guardian3Id: string;
  let guardianNewId: string; // extra guardian for duplicate priority scenario

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
    httpServer = app.getHttpServer();
    prisma = app.get<any>(require('../src/prisma/prisma.service').PrismaService);

    // Register and login two users
    user1Token = await registerAndLogin(app, 'user1@example.com');
    user2Token = await registerAndLogin(app, 'user2@example.com');

    // Create guardians for user1
    const g1 = await request(httpServer)
      .post('/guardians')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ firstName: 'Alice', lastName: 'Smith', email: 'alice1@example.com', relationship: 'Friend' })
      .expect(201);
    guardian1Id = g1.body.id;

    const g2 = await request(httpServer)
      .post('/guardians')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ firstName: 'Bob', lastName: 'Jones', email: 'bob2@example.com', relationship: 'Brother' })
      .expect(201);
    guardian2Id = g2.body.id;

    // Create a third guardian for user1 to test duplicate priority without guardian uniqueness conflict
    const gNew = await request(httpServer)
      .post('/guardians')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ firstName: 'Daisy', lastName: 'Hill', email: 'daisy4@example.com', relationship: 'Sister' })
      .expect(201);
    guardianNewId = gNew.body.id;

    // Create guardian for user2
    const g3 = await request(httpServer)
      .post('/guardians')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ firstName: 'Charlie', lastName: 'Brown', email: 'charlie3@example.com', relationship: 'Cousin' })
      .expect(201);
    guardian3Id = g3.body.id;
  });

  afterAll(async () => {
    try {
      const emails = ['user1@example.com', 'user2@example.com'];
      for (const email of emails) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) continue;
        const settings = await prisma.userSettings.findUnique({ where: { userId: user.id } });
        if (settings) {
          await prisma.heartbeatGuardianLink.deleteMany({ where: { userSettingsId: settings.id } });
          await prisma.userSettings.delete({ where: { id: settings.id } });
        }
        await prisma.guardian.deleteMany({ where: { userId: user.id } });
        await prisma.user.delete({ where: { id: user.id } });
      }
    } catch (e) {
      // swallow cleanup errors to not mask test results
    }
    await app.close();
  });

  describe('POST /user-settings/heartbeat-guardians', () => {
    it('should not assign a guardian without authentication', async () => {
      await request(httpServer)
        .post('/user-settings/heartbeat-guardians')
        .send({ guardianId: guardian1Id, priority: 1 })
        .expect(401);
    });

    it("should assign guardian1 to user1's heartbeat with priority 1", async () => {
      await request(httpServer)
        .post('/user-settings/heartbeat-guardians')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ guardianId: guardian1Id, priority: 1 })
        .expect(res => {
          if (![201, 204].includes(res.status)) {
            throw new Error(`Expected 201 or 204, got ${res.status}`);
          }
        });
    });

    it("should assign guardian2 to user1's heartbeat with priority 2", async () => {
      await request(httpServer)
        .post('/user-settings/heartbeat-guardians')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ guardianId: guardian2Id, priority: 2 })
        .expect(res => {
          if (![201, 204].includes(res.status)) {
            throw new Error(`Expected 201 or 204, got ${res.status}`);
          }
        });
    });

    it('should not assign a guardian with a duplicate priority', async () => {
      const res = await request(httpServer)
        .post('/user-settings/heartbeat-guardians')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ guardianId: guardianNewId, priority: 1 })
        .expect(409);
      expect(res.body?.message).toBe('Priority already in use.');
    });

    it('should not assign a guardian that is already assigned', async () => {
      const res = await request(httpServer)
        .post('/user-settings/heartbeat-guardians')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ guardianId: guardian2Id, priority: 3 })
        .expect(409);
      expect(res.body?.message).toBe('Guardian is already assigned.');
    });

    it("should not allow user1 to assign a guardian belonging to user2", async () => {
      await request(httpServer)
        .post('/user-settings/heartbeat-guardians')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ guardianId: guardian3Id, priority: 3 })
        .expect(403);
    });
  });

  describe('GET /user-settings/heartbeat-guardians', () => {
    it('should list assigned guardians sorted by priority with guardian details', async () => {
      // Ensure no prior assignments for guardian1/guardian2
      await request(httpServer)
        .delete(`/user-settings/heartbeat-guardians/${guardian1Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(204);
      await request(httpServer)
        .delete(`/user-settings/heartbeat-guardians/${guardian2Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(204);

      // Assign guardian1 with priority 2 and guardian2 with priority 1
      await request(httpServer)
        .post('/user-settings/heartbeat-guardians')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ guardianId: guardian1Id, priority: 2 })
        .expect(res => { if (![201, 204].includes(res.status)) throw new Error(`Unexpected status ${res.status}`); });

      await request(httpServer)
        .post('/user-settings/heartbeat-guardians')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ guardianId: guardian2Id, priority: 1 })
        .expect(res => { if (![201, 204].includes(res.status)) throw new Error(`Unexpected status ${res.status}`); });

      const listRes = await request(httpServer)
        .get('/user-settings/heartbeat-guardians')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(Array.isArray(listRes.body)).toBe(true);
      expect(listRes.body.length).toBeGreaterThanOrEqual(2);

      const [first, second] = listRes.body;
      expect(first.priority).toBe(1);
      expect(first.guardian).toBeTruthy();
      expect(first.guardian.id).toBe(guardian2Id);
      expect(first.guardian).toHaveProperty('firstName');
      expect(first.guardian).toHaveProperty('lastName');
      expect(first.guardian).toHaveProperty('email');
      expect(first.guardian).not.toHaveProperty('createdAt');
      expect(first.guardian).not.toHaveProperty('updatedAt');
      expect(first.guardian).not.toHaveProperty('userId');

      expect(second.priority).toBe(2);
      expect(second.guardian).toBeTruthy();
      expect(second.guardian.id).toBe(guardian1Id);
      expect(second.guardian).not.toHaveProperty('createdAt');
      expect(second.guardian).not.toHaveProperty('updatedAt');
      expect(second.guardian).not.toHaveProperty('userId');

      // Remove one guardian and verify list shrinks
      await request(httpServer)
        .delete(`/user-settings/heartbeat-guardians/${guardian2Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(204);

      const listRes2 = await request(httpServer)
        .get('/user-settings/heartbeat-guardians')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);
      expect(Array.isArray(listRes2.body)).toBe(true);
      expect(listRes2.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('DELETE /user-settings/heartbeat-guardians/:guardianId', () => {
    it('should not remove a guardian without authentication', async () => {
      await request(httpServer)
        .delete(`/user-settings/heartbeat-guardians/${guardian1Id}`)
        .expect(401);
    });

    it('should allow user1 to remove guardian1 from the heartbeat protocol', async () => {
      await request(httpServer)
        .delete(`/user-settings/heartbeat-guardians/${guardian1Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(204);
    });

    it('should do nothing if trying to remove a guardian that is not assigned', async () => {
      await request(httpServer)
        .delete(`/user-settings/heartbeat-guardians/${guardian1Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(204);
    });
  });
});

