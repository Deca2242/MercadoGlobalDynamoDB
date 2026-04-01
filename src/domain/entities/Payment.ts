export interface Payment {
  paymentId: string;
  userId: string;
  type: string;
  last4?: string;
}
