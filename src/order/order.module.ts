import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { KafkaModule } from 'src/kafka/kafka.module';
import { PrismaClient } from '@prisma/client';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { USER_PACKAGE_NAME, USER_SERVICE_NAME } from 'src/types/user';

@Module({
  imports: [
    KafkaModule,
    ClientsModule.register([
      {
        name: USER_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          package: USER_PACKAGE_NAME,
          protoPath: join(__dirname, '../../proto/user.proto'),
          url: process.env.USER_SERVICE_URL || 'localhost:50052',
        },
      },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService, PrismaClient],
})
export class OrderModule {}
