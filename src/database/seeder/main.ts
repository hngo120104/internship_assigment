import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { SeederService } from './services/seeder.service';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { StorageDriver } from 'typeorm-transactional';

async function bootstrap() {
  initializeTransactionalContext({
    storageDriver: StorageDriver.AUTO,
  });

  const app = await NestFactory.createApplicationContext(SeederModule);

  try {
    await app.get(SeederService).run();
  } finally {
    await app.close();
  }
}

bootstrap().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
