// orders.database.ts

import { Order, OrderStatus } from './payments.service';

// This is our permanent orders "database"
export const orders: Order[] = [];

export function addOrder(order: Order) {
    orders.push(order);
}
