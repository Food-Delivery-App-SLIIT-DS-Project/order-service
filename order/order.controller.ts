import { Controller } from '@nestjs/common';
import { GrpcMethod, MessagePattern, Payload } from '@nestjs/microservices';
import { OrderService } from './order.service';
import { OrderStatus } from '@prisma/client';


@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @GrpcMethod('OrderService', 'createOrder')
  @MessagePattern('CreateOrder')
  async create(@Payload() data: any) {
    return this.orderService.create(data);
  }

  @GrpcMethod('OrderService', 'findAllOrders')
  @MessagePattern('FindAllOrders')
  async findAll() {
    return this.orderService.findAll();
  }

  @GrpcMethod('OrderService', 'findOneOrder')
  @MessagePattern('FindOneOrder')
  async findOne(@Payload() data: { orderId: string }) {
    return this.orderService.findOne(data.orderId);
  }

  @GrpcMethod('OrderService', 'updateOrderStatus')
  @MessagePattern('UpdateOrderStatus')
  async updateOrderStatus(@Payload() data: { orderId: string; status: OrderStatus }) {
    console.log('Updating order status:', data);
    return this.orderService.updateStatus(data.orderId, data.status);
  }

  @GrpcMethod('OrderService', 'removeOrder')
  @MessagePattern('RemoveOrder')
  async remove(@Payload() data: { orderId: string }) {
    return this.orderService.remove(data.orderId);
  }
}
