import { Injectable } from '@nestjs/common';
import { OrderStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class OrderService {
  async create(data: {
    customerId: string;
    restaurantId: string;
    deliveryId?: string;
    status?: string;
    totalPrice: number;
    items: Array<{
      menuId: string;
      quantity: number;
      price: number;
    }>;
  }) {
    const validStatuses = Object.values(OrderStatus);
    const status = data.status && validStatuses.includes(data.status.toUpperCase() as OrderStatus)
      ? data.status.toUpperCase()
      : 'PENDING';

    const createdOrder = await prisma.order.create({
      data: {
        customerID: data.customerId,
        restaurantID: data.restaurantId,
        deliveryID: data.deliveryId,
        totalPrice: data.totalPrice,
        status: status as OrderStatus,
        items: {
          create: data.items.map(item => ({
            menuID: item.menuId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return this.formatOrder(createdOrder);
  }

  async findAll() {
    const orders = await prisma.order.findMany({ include: { items: true } });
    return { orders: orders.map(this.formatOrder) };
  }

  async findOne(orderID: string) {
    const order = await prisma.order.findUnique({
      where: { orderID },
      include: { items: true },
    });

    if (!order) return null;
    return this.formatOrder(order);
  }

  async updateStatus(orderID: string, status: OrderStatus) {
    const updated = await prisma.order.update({
      where: { orderID },
      data: { status },
      include: { items: true },
    });
  
    return this.formatOrder(updated);
  }

  async remove(orderID: string) {
    await prisma.order.delete({ where: { orderID } });
    return { message: `Order id ${orderID} removed` };
  }

  private formatOrder(order: any) {
    return {
      orderId: order.orderID,
      customerId: order.customerID,
      restaurantId: order.restaurantID,
      deliveryId: order.deliveryID,
      status: order.status,
      totalPrice: parseFloat(order.totalPrice),
      items: order.items.map(item => ({
        menuId: item.menuID,
        quantity: item.quantity,
        price: parseFloat(item.price),
      })),
    };
  }
}
