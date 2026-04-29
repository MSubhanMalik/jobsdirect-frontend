import axiosInstance from "./AxiosService";
import { api } from "@/config/api";
import type { Employer, EmployerCreatePayload, EmployerUpdatePayload } from "@/types/employer";
import type { ListQuery, PaginatedResponse } from "@/types/api";

class EmployerService {
  async list(query: ListQuery = {}): Promise<PaginatedResponse<Employer>> {
    const params = new URLSearchParams();
    if (!query.page) params.set("page", "1");
    if (!query.pageSize) params.set("pageSize", "100");
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
    });
    const res = await axiosInstance.get<PaginatedResponse<Employer>>(
      `${api.endpoints.EMPLOYERS}?${params.toString()}`,
    );
    return res.data;
  }

  async getById(id: string): Promise<Employer> {
    const url = api.endpoints.EMPLOYER_DETAIL.replace(":id", id);
    const res = await axiosInstance.get<Employer>(url);
    return res.data;
  }

  async create(payload: EmployerCreatePayload): Promise<Employer> {
    const res = await axiosInstance.post<Employer>(
      api.endpoints.EMPLOYERS,
      payload,
    );
    return res.data;
  }

  async update(id: string, updates: EmployerUpdatePayload): Promise<Employer> {
    const url = api.endpoints.EMPLOYER_DETAIL.replace(":id", id);
    const res = await axiosInstance.put<Employer>(url, updates);
    return res.data;
  }

  async remove(id: string): Promise<void> {
    const url = api.endpoints.EMPLOYER_DETAIL.replace(":id", id);
    await axiosInstance.delete(url);
  }
}

export default new EmployerService();
