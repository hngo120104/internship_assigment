import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { ValidationError } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { initializeTransactionalContext, StorageDriver} from 'typeorm-transactional';


async function bootstrap() {
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });

  const app = await NestFactory.create(AppModule, {
    abortOnError: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[]) => {
        // Extract all constraint messages into a flat array
        const messages = validationErrors.flatMap((error) => 
          Object.values(error.constraints || {})
        );

        // Return ONLY the message property inside the exception
        return new BadRequestException({
          message: messages.join('\n'), // Or just 'messages' if you prefer an array
        });
      },
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
