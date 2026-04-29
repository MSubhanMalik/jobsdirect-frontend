export interface Payment {
  id: string;
  userId: string;
  employerId?: string;
  stripeSessionId?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  planId: string;
  kind: string;
  credits: number;
  amountTotal?: number;
  currency: string;
  mode?: string;
  status: string;
  paymentStatus?: string;
  checkoutUrl?: string;
  fulfilledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  credits?: number;
  interval?: string;
  [key: string]: any;
}

export interface CheckoutPayload {
  planId?: string;
  kind?: string;
  [key: string]: any;
}

export interface CheckoutSession {
  url: string;
  sessionId: string;
}

export interface PricingInfo {
  [key: string]: any;
}

export interface CreditBalance {
  credits: number;
  [key: string]: any;
}
