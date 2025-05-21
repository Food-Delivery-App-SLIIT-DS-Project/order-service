/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller } from '@nestjs/common';
import { OrderService } from './order.service';
import {
  CreateOrderRequest,
  CustomerID,
  OrderId,
  OrderList,
  OrderResponse,
  OrderServiceController,
  RemoveResponse,
  RestaurantID,
  UpdateStatusRequest,
} from 'src/types';
import { GrpcMethod, MessagePattern } from '@nestjs/microservices';

@Controller()
export class OrderController implements OrderServiceController {
  constructor(private readonly orderService: OrderService) {}

  // get order by restaurantId
  @GrpcMethod('OrderService', 'getOrderByRestaurantId')
  @MessagePattern('GetOrderByRestaurantId')
  getOrderByRestaurantId(data: RestaurantID): Promise<OrderList> {
    return this.orderService.getOrderByRestaurantId(data);
  }
  // get order by customerId
  @GrpcMethod('OrderService', 'getOrderByCustomerId')
  @MessagePattern('GetOrderByCustomerId')
  getOrderByCustomerId(data: CustomerID): Promise<OrderList> {
    return this.orderService.getOrderByCustomerId(data);
  }

  @GrpcMethod('OrderService', 'createOrder')
  @MessagePattern('CreateOrder')
  async createOrder(data: CreateOrderRequest): Promise<OrderResponse> {
    console.log('Creating order:', data);
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

  // assign delivery id
  @GrpcMethod('OrderService', 'assignDeliveryId')
  @MessagePattern('AssignDeliveryId')
  assignDeliveryId(data: {
    orderId: string;
    deliveryId: string;
  }): Promise<OrderResponse> {
    return this.orderService.assignDeliveryId(data.orderId, data.deliveryId);
  }
}
