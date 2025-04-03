import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        protoPath: join(__dirname, '../order.proto'),
        package: 'order',
        url: 'localhost:50055',
      },
    },
  );
  app.enableShutdownHooks();
  await app.listen();
  console.log('Order service is running on: http://localhost:50055');
}
void bootstrap();
