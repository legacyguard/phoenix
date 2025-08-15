import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('UserSettings (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
    prisma = app.get(PrismaService);

    // Clean up database before tests
    await prisma.userSettings.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.userSettings.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('/user-settings', () => {
    const testUser = {
      email: 'test@example.com',
      password: 'password123',
    };
    let token: string;

    beforeAll(async () => {
      // Register and login user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser)
        .expect(200);

      token = loginResponse.body.accessToken;
    });

    describe('GET /user-settings', () => {
      it('should return user settings when authenticated', async () => {
        const response = await request(app.getHttpServer())
          .get('/user-settings')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(response.body).toHaveProperty('heartbeatIntervalDays', 30);
        expect(response.body).toHaveProperty('isHeartbeatActive', false);
        expect(response.body).toHaveProperty('lastHeartbeatAt', null);
        expect(response.body).toHaveProperty('notificationChannels');
        expect(response.body.notificationChannels).toEqual(['email']);
      });

      it('should return 401 when not authenticated', async () => {
        await request(app.getHttpServer())
          .get('/user-settings')
          .expect(401);
      });
    });

    describe('PATCH /user-settings', () => {
      it('should update user settings when authenticated', async () => {
        const updateData = {
          heartbeatIntervalDays: 60,
          isHeartbeatActive: true,
          notificationChannels: ['email'],
        };

        const response = await request(app.getHttpServer())
          .patch('/user-settings')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData)
          .expect(200);

        expect(response.body.heartbeatIntervalDays).toBe(60);
        expect(response.body.isHeartbeatActive).toBe(true);
        expect(response.body.notificationChannels).toEqual(['email']);
      });

      it('should allow empty notification channels array', async () => {
        const updateData = {
          notificationChannels: [],
        };

        const response = await request(app.getHttpServer())
          .patch('/user-settings')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData)
          .expect(200);

        expect(response.body.notificationChannels).toEqual([]);
      });

      it('should not update settings when not authenticated', async () => {
        await request(app.getHttpServer())
          .patch('/user-settings')
          .send({ heartbeatIntervalDays: 60 })
          .expect(401);
      });

      it('should not update settings with invalid data', async () => {
        await request(app.getHttpServer())
          .patch('/user-settings')
          .set('Authorization', `Bearer ${token}`)
          .send({ heartbeatIntervalDays: 5, isHeartbeatActive: 'not-a-boolean' })
          .expect(400);
      });

      it('should not allow heartbeatIntervalDays > 365', async () => {
        await request(app.getHttpServer())
          .patch('/user-settings')
          .set('Authorization', `Bearer ${token}`)
          .send({ heartbeatIntervalDays: 366 })
          .expect(400);
      });

      it('should not allow invalid notification channels', async () => {
        await request(app.getHttpServer())
          .patch('/user-settings')
          .set('Authorization', `Bearer ${token}`)
          .send({ notificationChannels: ['sms'] })
          .expect(400);
      });

      it('should not allow notification channels that are not an array', async () => {
        await request(app.getHttpServer())
          .patch('/user-settings')
          .set('Authorization', `Bearer ${token}`)
          .send({ notificationChannels: 'email' })
          .expect(400);
      });
    });

    describe('POST /user-settings/heartbeat', () => {
      it('should return 400 if heartbeat is recorded but the protocol is not active', async () => {
        // First, ensure protocol is inactive
        await request(app.getHttpServer())
          .patch('/user-settings')
          .set('Authorization', `Bearer ${token}`)
          .send({ isHeartbeatActive: false })
          .expect(200);

        await request(app.getHttpServer())
          .post('/user-settings/heartbeat')
          .set('Authorization', `Bearer ${token}`)
          .expect(400);
      });

      it('should successfully record a heartbeat when the protocol is active', async () => {
        // First, activate the protocol and record heartbeat in one test
        await request(app.getHttpServer())
          .patch('/user-settings')
          .set('Authorization', `Bearer ${token}`)
          .send({ isHeartbeatActive: true })
          .expect(200);

        // Record heartbeat
        await request(app.getHttpServer())
          .post('/user-settings/heartbeat')
          .set('Authorization', `Bearer ${token}`)
          .expect(204);

        // Verify that lastHeartbeatAt was updated
        const settingsResponse = await request(app.getHttpServer())
          .get('/user-settings')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(settingsResponse.body.lastHeartbeatAt).not.toBeNull();
        
        // Verify the timestamp is recent (within last 5 seconds)
        const heartbeatTime = new Date(settingsResponse.body.lastHeartbeatAt);
        const now = new Date();
        const timeDiff = Math.abs(now.getTime() - heartbeatTime.getTime());
        expect(timeDiff).toBeLessThan(5000); // 5 seconds
      });

      it('should return 401 when not authenticated', async () => {
        await request(app.getHttpServer())
          .post('/user-settings/heartbeat')
          .expect(401);
      });
    });
  });
});


