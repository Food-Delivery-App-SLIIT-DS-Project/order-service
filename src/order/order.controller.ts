/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller } from '@nestjs/common';
import { OrderService } from './order.service';
import {
  CreateOrderDto,
  CreateOrderRequest,
  Empty,
  FineOneOrderDto,
  Order,
  OrderList,
  OrderResponse,
  OrderServiceController,
  UpdateOrderDto,
} from 'src/types';
import { GrpcMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';

@Controller()
export class OrderController implements OrderServiceController {
  constructor(private readonly orderService: OrderService) {}
  createOrder(
    request: CreateOrderDto,
  ): Promise<Order> | Observable<Order> | Order {
    throw new Error('Method not implemented.');
  }
  findAllOrders(
    request: Empty,
  ): Promise<OrderList> | Observable<OrderList> | OrderList {
    throw new Error('Method not implemented.');
  }
  findOrderById(
    request: FineOneOrderDto,
  ): Promise<Order> | Observable<Order> | Order {
    throw new Error('Method not implemented.');
  }
  updateOrder(
    request: UpdateOrderDto,
  ): Promise<Order> | Observable<Order> | Order {
    throw new Error('Method not implemented.');
  }
  deleteOrder(
    request: FineOneOrderDto,
  ): Promise<Order> | Observable<Order> | Order {
    throw new Error('Method not implemented.');
  }
  @GrpcMethod('OrderService', 'PlaceOrder')
  placeOrder(data: CreateOrderRequest): Promise<OrderResponse> {
    return this.orderService.placeOrder(data);
  }
}
