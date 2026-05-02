import axiosInstance from "./AxiosService";
import { api } from "@/config/api";
import type {
  Payment,
  PaymentPlan,
  CheckoutPayload,
  CheckoutSession,
  PricingInfo,
  CreditBalance,
} from "@/types/payment";
import type { ListQuery } from "@/types/api";

class PaymentService {
  async listPlans(): Promise<PaymentPlan[]> {
    const res = await axiosInstance.get<PaymentPlan[]>(
      api.endpoints.PAYMENT_PLANS,
    );
    return Array.isArray(res.data) ? res.data : [];
  }

  async list(query: ListQuery = {}): Promise<Payment[]> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) params.set(key, String(value));
    });
    const qs = params.toString();
    const res = await axiosInstance.get<Payment[]>(
      `${api.endpoints.PAYMENTS}${qs ? `?${qs}` : ""}`,
    );
    return Array.isArray(res.data) ? res.data : [];
  }

  async createCheckoutSession(payload: CheckoutPayload): Promise<CheckoutSession> {
    const res = await axiosInstance.post<CheckoutSession>(
      api.endpoints.PAYMENT_CHECKOUT,
      payload,
    );
    return res.data;
  }

  async syncCheckoutSession(sessionId: string): Promise<any> {
    const res = await axiosInstance.post(api.endpoints.PAYMENT_SYNC_SESSION, {
      session_id: sessionId,
    });
    return res.data;
  }

  async createPortalSession(payload: Record<string, any> = {}): Promise<{ url: string }> {
    const res = await axiosInstance.post<{ url: string }>(
      api.endpoints.PAYMENT_PORTAL,
      payload,
    );
    return res.data;
  }

  async getPricing(): Promise<PricingInfo> {
    const res = await axiosInstance.get<PricingInfo>(
      api.endpoints.PAYMENT_PRICING,
    );
    return res.data;
  }

  async getBalance(employerId?: string): Promise<CreditBalance> {
    const qs = employerId ? `?employer_id=${employerId}` : "";
    const res = await axiosInstance.get<CreditBalance>(
      `${api.endpoints.PAYMENT_BALANCE}${qs}`,
    );
    return res.data;
  }

  async getTransactions(employerId?: string, page = 1): Promise<any> {
    const params = new URLSearchParams();
    if (employerId) params.set("employer_id", employerId);
    params.set("page", String(page));
    params.set("pageSize", "20");
    const res = await axiosInstance.get(
      `${api.endpoints.PAYMENT_TRANSACTIONS}?${params.toString()}`,
    );
    return res.data;
  }
}

export default new PaymentService();
