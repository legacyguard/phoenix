import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
  }

  async onModuleInit() {
    try {
      // Tento príkaz zaistí, že sa aplikácia pripojí k databáze pri štarte.
      await this.$connect();
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Failed to connect to database:', error);
      console.error('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
