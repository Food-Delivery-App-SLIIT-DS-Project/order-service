/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller } from '@nestjs/common';
import { OrderService } from './order.service';
import {
  CreateOrderRequest,
  OrderId,
  OrderList,
  OrderResponse,
  OrderServiceController,
  RemoveResponse,
  UpdateStatusRequest,
} from 'src/types';
import { GrpcMethod, MessagePattern } from '@nestjs/microservices';

@Controller()
export class OrderController implements OrderServiceController {
  constructor(private readonly orderService: OrderService) {}

  @GrpcMethod('OrderService', 'createOrder')
  @MessagePattern('CreateOrder')
  async createOrder(data: CreateOrderRequest): Promise<OrderResponse> {
    return await this.orderService.create(data);
  }

  @GrpcMethod('OrderService', 'findAllOrders')
  @MessagePattern('FindAllOrders')
  findAllOrders(): Promise<OrderList> {
    return this.orderService.findAll();
  }

  @GrpcMethod('OrderService', 'findOneOrder')
  @MessagePattern('FindOneOrder')
  findOneOrder(data: OrderId): Promise<OrderResponse> {
    return this.orderService.findOne(data);
  }

  @GrpcMethod('OrderService', 'updateOrderStatus')
  @MessagePattern('UpdateOrderStatus')
  updateOrderStatus(data: UpdateStatusRequest): Promise<OrderResponse> {
    console.log('Updating order status:', data);
    return this.orderService.updateStatus(data.orderId, data.status);
  }

  @GrpcMethod('OrderService', 'removeOrder')
  @MessagePattern('RemoveOrder')
  removeOrder(data: OrderId): Promise<RemoveResponse> {
    return this.orderService.remove(data.orderId);
  }
}
