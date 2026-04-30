export interface Product {
  id: string;
  name: string;
  description: string;
  type: "listing" | "addon" | "credit_bundle" | "subscription";
  creditCost?: number;
  credits?: number;
  stripeProductId?: string;
  icon?: string;
  appliesTo?: string;
  duration?: number;
  enabled: boolean;
}

export interface CostEstimate {
  total: number;
  listing: { id: string; name: string; creditCost: number };
  addons: { id: string; name: string; creditCost: number }[];
}
