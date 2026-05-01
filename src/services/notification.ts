import axiosInstance from "./AxiosService";
import { api } from "@/config/api";

class NotificationApiService {
  async list(page = 1): Promise<any> {
    const res = await axiosInstance.get(`${api.endpoints.NOTIFICATIONS}?page=${page}`);
    return res.data;
  }

  async markAsRead(id: string): Promise<any> {
    const url = api.endpoints.NOTIFICATION_READ.replace(":id", id);
    const res = await axiosInstance.post(url);
    return res.data;
  }

  async markAllAsRead(): Promise<any> {
    const res = await axiosInstance.post(api.endpoints.NOTIFICATIONS_READ_ALL);
    return res.data;
  }

  async remove(id: string): Promise<any> {
    const res = await axiosInstance.delete(`${api.endpoints.NOTIFICATIONS}/${id}`);
    return res.data;
  }
}

export default new NotificationApiService();
