/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Module } from '@nestjs/common';
import { OrderModule } from './order/order.module';
import { ConfigModule } from '@nestjs/config';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    OrderModule,
    KafkaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
