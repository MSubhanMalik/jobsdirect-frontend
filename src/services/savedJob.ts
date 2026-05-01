import axiosInstance from "./AxiosService";
import { api } from "@/config/api";

class SavedJobService {
  async list(): Promise<any[]> {
    const res = await axiosInstance.get(api.endpoints.SAVED_JOBS);
    return Array.isArray(res.data) ? res.data : [];
  }

  async toggle(jobId: string): Promise<{ saved: boolean }> {
    const res = await axiosInstance.post(api.endpoints.SAVED_JOBS_TOGGLE, { jobId });
    return res.data;
  }

  async check(jobId: string): Promise<{ saved: boolean }> {
    const res = await axiosInstance.get(`${api.endpoints.SAVED_JOBS_CHECK}?jobId=${jobId}`);
    return res.data;
  }
}

export default new SavedJobService();
