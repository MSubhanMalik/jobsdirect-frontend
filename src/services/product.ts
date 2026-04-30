import axiosInstance from "./AxiosService";
import { api } from "@/config/api";
import type { Product, CostEstimate } from "@/types/product";

class ProductService {
  async getAll(): Promise<Product[]> {
    const res = await axiosInstance.get<Product[]>(api.endpoints.PRODUCTS);
    return Array.isArray(res.data) ? res.data : [];
  }

  async getAddons(): Promise<Product[]> {
    const res = await axiosInstance.get<Product[]>(api.endpoints.PRODUCTS_ADDONS);
    return Array.isArray(res.data) ? res.data : [];
  }

  async getCostEstimate(addonIds: string[]): Promise<CostEstimate> {
    const res = await axiosInstance.post<CostEstimate>(
      api.endpoints.PRODUCTS_COST_ESTIMATE,
      { addonIds },
    );
    return res.data;
  }
}

export default new ProductService();
