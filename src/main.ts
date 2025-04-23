import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { ORDER_PACKAGE_NAME } from './types';

async function bootstrap() {
  // Load environment variables
  void ConfigModule.forRoot({ isGlobal: true });
  const url = process.env.ORDER_SERVICE_URL || 'localhost:50054';
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        protoPath: join(__dirname, '../order.proto'),
        package: ORDER_PACKAGE_NAME,
        url: url, // order-service
      },
    },
  );
  app.enableShutdownHooks();
  await app.listen();
  console.log(`Order service is running on ${url}`);
}
void bootstrap();
