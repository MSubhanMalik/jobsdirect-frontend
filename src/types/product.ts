export interface Product {
  id: string;
  name: string;
  description: string;
  type: "listing" | "addon" | "credit_bundle" | "subscription";
  credit_cost?: number;
  credits?: number;
  stripe_product_id?: string;
  icon?: string;
  appliesTo?: string;
  duration?: number;
  enabled: boolean;
}

export interface CostEstimate {
  total: number;
  listing: { id: string; name: string; credit_cost: number };
  addons: { id: string; name: string; credit_cost: number }[];
}
