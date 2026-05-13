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

  async searchCRO(query: string): Promise<any[]> {
    const res = await axiosInstance.get(`${api.endpoints.EMPLOYER_CRO_SEARCH}?q=${encodeURIComponent(query)}`);
    return (res.data as any)?.data || res.data;
  }

  async getCROCompany(num: string): Promise<any> {
    const url = api.endpoints.EMPLOYER_CRO_COMPANY.replace(":num", num);
    const res = await axiosInstance.get(url);
    return (res.data as any)?.data || res.data;
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

  async uploadVerificationDoc(id: string, file: File): Promise<{ verificationDocUrl: string }> {
    const formData = new FormData();
    formData.append("file", file);
    const url = `${api.endpoints.EMPLOYERS}/${id}/verification-doc`;
    const res = await axiosInstance.post<{ verificationDocUrl: string }>(url, formData);
    return res.data;
  }

  async submitForVerification(id: string): Promise<Employer> {
    const url = `${api.endpoints.EMPLOYERS}/${id}/submit-for-verification`;
    const res = await axiosInstance.post<Employer>(url);
    return res.data;
  }

  async getDocumentRequests(id: string): Promise<any[]> {
    const url = api.endpoints.EMPLOYER_DOCUMENT_REQUESTS.replace(":id", id);
    const res = await axiosInstance.get(url);
    return (res.data as any)?.data || res.data;
  }

  async createDocumentRequests(id: string, documents: { title: string; description?: string }[]): Promise<any[]> {
    const url = api.endpoints.EMPLOYER_DOCUMENT_REQUESTS.replace(":id", id);
    const res = await axiosInstance.post(url, { documents });
    return (res.data as any)?.data || res.data;
  }

  async uploadDocument(employerId: string, requestId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    const url = api.endpoints.EMPLOYER_DOCUMENT_UPLOAD.replace(":id", employerId).replace(":requestId", requestId);
    const res = await axiosInstance.post(url, formData);
    return (res.data as any)?.data || res.data;
  }

  async reviewDocument(employerId: string, requestId: string, status: string, adminNote?: string): Promise<any> {
    const url = api.endpoints.EMPLOYER_DOCUMENT_REVIEW.replace(":id", employerId).replace(":requestId", requestId);
    const res = await axiosInstance.put(url, { status, admin_note: adminNote });
    return (res.data as any)?.data || res.data;
  }
}

export default new EmployerService();
