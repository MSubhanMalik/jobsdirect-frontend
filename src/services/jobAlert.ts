import axiosInstance from "./AxiosService";
import { api } from "@/config/api";

class JobAlertService {
  async list(): Promise<any[]> {
    const res = await axiosInstance.get(api.endpoints.JOB_ALERTS);
    return Array.isArray(res.data) ? res.data : [];
  }

  async create(data: Record<string, any>): Promise<any> {
    const res = await axiosInstance.post(api.endpoints.JOB_ALERTS, data);
    return res.data;
  }

  async update(id: string, data: Record<string, any>): Promise<any> {
    const url = api.endpoints.JOB_ALERT_DETAIL.replace(":id", id);
    const res = await axiosInstance.put(url, data);
    return res.data;
  }

  async toggle(id: string): Promise<any> {
    const url = api.endpoints.JOB_ALERT_TOGGLE.replace(":id", id);
    const res = await axiosInstance.post(url);
    return res.data;
  }

  async remove(id: string): Promise<void> {
    const url = api.endpoints.JOB_ALERT_DETAIL.replace(":id", id);
    await axiosInstance.delete(url);
  }
}

export default new JobAlertService();
