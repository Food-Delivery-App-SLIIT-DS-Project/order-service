/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { status } from '@grpc/grpc-js';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc, ClientKafka, RpcException } from '@nestjs/microservices';
import { OrderStatus, PrismaClient } from '@prisma/client';
import { lastValueFrom } from 'rxjs';
import {
  CreateOrderRequest,
  OrderId,
  OrderList,
  OrderResponse,
  RemoveResponse,
} from 'src/types';
import {
  FineOneUserDto,
  USER_SERVICE_NAME,
  UserResponse,
  UserServiceClient,
} from 'src/types/user';

@Injectable()
export class OrderService implements OnModuleInit {
  private userServiceClient: UserServiceClient;
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
    @Inject(USER_SERVICE_NAME) private client: ClientGrpc,
    private readonly PrismaService: PrismaClient,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
    this.userServiceClient =
      this.client.getService<UserServiceClient>(USER_SERVICE_NAME);
  }

  // Utility to map Prisma Order to OrderResponse
  private mapOrder(order: any): OrderResponse {
    return {
      orderId: order.orderID,
      customerId: order.customerID,
      restaurantId: order.restaurantID,
      deliveryId: order.deliveryID ?? '',
      status: order.status,
      totalPrice: order.totalPrice?.toNumber() ?? 0,
      items:
        order.items?.map((item) => ({
          menuId: item.menuID,
          quantity: item.quantity,
          price: item.price.toNumber(),
        })) ?? [],
    };
  }

  private throwNotFound(id: string) {
    throw new RpcException({
      code: status.NOT_FOUND,
      message: `Order with ID ${id} not found`,
    });
  }

  // Create order
  async create(data: CreateOrderRequest): Promise<OrderResponse> {
    try {
      const order = await this.PrismaService.order.create({
        data: {
          customerID: data.customerId,
          restaurantID: data.restaurantId,
          deliveryID: data.deliveryId,
          status: data.status as OrderStatus,
          totalPrice: data.totalPrice,
          items: {
            createMany: {
              data: data.items.map((item) => ({
                menuID: item.menuId,
                quantity: item.quantity,
                price: item.price,
              })),
            },
          },
        },
        include: { items: true },
      });
      const currentUser = await this.getUserById(data.customerId);
      if (!currentUser) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'User not found',
        });
      }
      // Emit to Kafka topic
      this.kafkaClient.emit('ORDER_PLACED', {
        user: currentUser,
        orderId: order.orderID,
        // deliveryEstimate: '30 mins',
      });

      return this.mapOrder(order);
    } catch (err) {
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Failed to create order',
      });
    }
  }

  // Get all orders
  async findAll(): Promise<OrderList> {
    try {
      const orders = await this.PrismaService.order.findMany({
        include: { items: true },
      });

      return { orders: orders.map(this.mapOrder) };
    } catch {
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Failed to fetch orders',
      });
    }
  }

  // Get single order
  async findOne(orderId: OrderId): Promise<OrderResponse> {
    const order = await this.PrismaService.order.findUnique({
      where: { orderID: orderId.orderId },
      include: { items: true },
    });

    if (!order) this.throwNotFound(orderId.orderId);
    return this.mapOrder(order);
  }

  // Update order status
  async updateStatus(
    orderId: string,
    newStatus: string,
  ): Promise<OrderResponse> {
    console.log(orderId, newStatus);
    try {
      const updated = await this.PrismaService.order.update({
        where: { orderID: orderId },
        data: { status: newStatus as OrderStatus },
        include: { items: true },
      });
      console.log('Updated order:', updated);
      return this.mapOrder(updated);
    } catch (err) {
      if (err.code === 'P2025') this.throwNotFound(orderId); // Prisma "not found" error
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Failed to update order status',
      });
    }
  }

  // Remove order
  async remove(orderId: string): Promise<RemoveResponse> {
    try {
      await this.PrismaService.order.delete({
        where: { orderID: orderId },
      });
      return { message: 'Order removed successfully' };
    } catch (err) {
      if (err.code === 'P2025') this.throwNotFound(orderId);
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Failed to remove order',
      });
    }
  }

  // get userby userid
  async getUserById(userId: string): Promise<UserResponse> {
    const FineOneUserDto: FineOneUserDto = { userId };
    try {
      const user = await lastValueFrom(
        this.userServiceClient.findUserById(FineOneUserDto),
      );
      if (!user) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'User not found',
        });
      }
      return user;
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Failed to fetch user',
      });
    }
  }
}
