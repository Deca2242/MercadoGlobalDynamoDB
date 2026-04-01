export interface Order {
  orderId: string;
  userId: string;
  status: string;
  total: number;
  date: string;
  shippingAddress: string;
}
