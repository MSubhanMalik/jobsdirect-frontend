import axiosInstance from "./AxiosService";
import { api } from "@/config/api";
import type { Application, ApplicationCreatePayload, ApplicationUpdatePayload } from "@/types/application";
import type { ListQuery, PaginatedResponse } from "@/types/api";

class ApplicationService {
  async list(query: ListQuery = {}): Promise<PaginatedResponse<Application>> {
    const params = new URLSearchParams();
    if (!query.page) params.set("page", "1");
    if (!query.pageSize) params.set("pageSize", "100");
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
    });
    const res = await axiosInstance.get<PaginatedResponse<Application>>(
      `${api.endpoints.APPLICATIONS}?${params.toString()}`,
    );
    return res.data;
  }

  async getById(id: string): Promise<Application> {
    const url = api.endpoints.APPLICATION_DETAIL.replace(":id", id);
    const res = await axiosInstance.get<Application>(url);
    return res.data;
  }

  async create(payload: ApplicationCreatePayload): Promise<Application> {
    const res = await axiosInstance.post<Application>(
      api.endpoints.APPLICATIONS,
      payload,
    );
    return res.data;
  }

  async guestApply(payload: Record<string, any>): Promise<any> {
    const res = await axiosInstance.post(
      api.endpoints.APPLICATION_GUEST,
      payload,
    );
    return res.data;
  }

  async update(id: string, updates: ApplicationUpdatePayload): Promise<Application> {
    const url = api.endpoints.APPLICATION_DETAIL.replace(":id", id);
    const res = await axiosInstance.put<Application>(url, updates);
    return res.data;
  }

  async remove(id: string): Promise<void> {
    const url = api.endpoints.APPLICATION_DETAIL.replace(":id", id);
    await axiosInstance.delete(url);
  }
}

export default new ApplicationService();
