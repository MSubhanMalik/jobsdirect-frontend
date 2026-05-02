export interface Payment {
  id: string;
  user_id: string;
  employer_id?: string;
  stripe_session_id?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  plan_id: string;
  kind: string;
  credits: number;
  amount_total?: number;
  currency: string;
  mode?: string;
  status: string;
  payment_status?: string;
  checkout_url?: string;
  fulfilled_at?: string;
  created_at: string;
  updated_at: string;
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
  plan_id?: string;
  kind?: string;
  [key: string]: any;
}

export interface CheckoutSession {
  url: string;
  session_id: string;
}

export interface PricingInfo {
  [key: string]: any;
}

export interface CreditBalance {
  credits: number;
  [key: string]: any;
}
