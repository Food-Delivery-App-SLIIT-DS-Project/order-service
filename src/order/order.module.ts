import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { KafkaModule } from 'src/kafka/kafka.module';

@Module({
  imports: [KafkaModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
