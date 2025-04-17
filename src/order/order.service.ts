/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { CreateOrderRequest, OrderResponse } from 'src/types';

@Injectable()
export class OrderService {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}
  // Optional: wait for connection
  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  placeOrder(orderData: CreateOrderRequest): Promise<OrderResponse> {
    console.log('Placing order:', orderData);
    // Save order logic...

    // Emit to Kafka topic
    this.kafkaClient.emit('ORDER_PLACED', {
      user: orderData.user,
      orderId: orderData.orderId,
      deliveryEstimate: '30 mins',
    });

    return Promise.resolve({
      orderId: orderData.orderId,
      status: 'Order placed successfully',
      estimatedDelivery: '30 mins',
    } as OrderResponse);
  }
}
