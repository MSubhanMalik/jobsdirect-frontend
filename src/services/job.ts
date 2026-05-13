import axiosInstance from "./AxiosService";
import { api } from "@/config/api";
import type { Job, JobCreatePayload, JobUpdatePayload, JobFilters, JobCostEstimate } from "@/types/job";
import type { PaginatedResponse } from "@/types/api";

class JobService {
  async list(filters: JobFilters = {}): Promise<PaginatedResponse<Job>> {
    const params = new URLSearchParams();
    if (!filters.page) params.set("page", "1");
    if (!filters.pageSize) params.set("pageSize", "100");
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    });
    const res = await axiosInstance.get<PaginatedResponse<Job>>(
      `${api.endpoints.JOBS}?${params.toString()}`,
    );
    return res.data;
  }

  async getById(id: string): Promise<Job> {
    const url = api.endpoints.JOB_DETAIL.replace(":id", id);
    const res = await axiosInstance.get<Job>(url);
    return res.data;
  }

  async create(payload: JobCreatePayload): Promise<Job> {
    const res = await axiosInstance.post<Job>(api.endpoints.JOBS, payload);
    return res.data;
  }

  async update(id: string, updates: JobUpdatePayload): Promise<Job> {
    const url = api.endpoints.JOB_DETAIL.replace(":id", id);
    const res = await axiosInstance.put<Job>(url, updates);
    return res.data;
  }

  async remove(id: string): Promise<void> {
    const url = api.endpoints.JOB_DETAIL.replace(":id", id);
    await axiosInstance.delete(url);
  }

  async renew(id: string): Promise<Job> {
    const url = api.endpoints.JOB_DETAIL.replace(":id", id);
    const res = await axiosInstance.post<Job>(`${url}/renew`);
    return res.data;
  }

  async activateAddon(id: string, addonId: string): Promise<Job> {
    const url = api.endpoints.JOB_ACTIVATE_ADDON.replace(":id", id);
    const res = await axiosInstance.post<Job>(url, { addonId });
    return res.data;
  }

  async duplicate(id: string): Promise<Job> {
    const url = api.endpoints.JOB_DUPLICATE.replace(":id", id);
    const res = await axiosInstance.post<Job>(url);
    return res.data;
  }

  async checkout(id: string): Promise<Job> {
    const url = api.endpoints.JOB_DETAIL.replace(":id", id);
    const res = await axiosInstance.post<Job>(`${url}/checkout`);
    return res.data;
  }

  async costEstimate(payload: Record<string, any>): Promise<JobCostEstimate> {
    const res = await axiosInstance.post<JobCostEstimate>(
      api.endpoints.JOB_COST_ESTIMATE,
      payload,
    );
    return res.data;
  }

  async scanContent(title: string, description: string, jobId?: string): Promise<{ approved: boolean; severity?: string; issues: any[] }> {
    const res = await axiosInstance.post(api.endpoints.JOB_SCAN_CONTENT, { title, description, job_id: jobId });
    // Backend wraps in { data, message, status, success } — unwrap
    return (res.data as any)?.data || res.data;
  }

  async resubmit(id: string, payload: Record<string, any>): Promise<Job> {
    const url = api.endpoints.JOB_RESUBMIT.replace(":id", id);
    const res = await axiosInstance.post<Job>(url, payload);
    return res.data;
  }

  async getReport(id: string): Promise<any> {
    const url = api.endpoints.JOB_REPORT.replace(":id", id);
    const res = await axiosInstance.get(url);
    return res.data;
  }

  async scrapeJobsIreland(payload: Record<string, any>): Promise<any> {
    const res = await axiosInstance.post(
      api.endpoints.JOB_SCRAPE_JOBSIRELAND,
      payload,
    );
    return res.data;
  }
}

export default new JobService();
