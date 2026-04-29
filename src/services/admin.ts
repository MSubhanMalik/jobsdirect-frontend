import axiosInstance from "./AxiosService";
import { api } from "@/config/api";
import type { User } from "@/types/auth";

class AdminService {
  async listUsers(): Promise<User[]> {
    const res = await axiosInstance.get<User[]>(api.endpoints.ADMIN_USERS);
    return Array.isArray(res.data) ? res.data : [];
  }

  async createUser(payload: Record<string, any>): Promise<User> {
    const res = await axiosInstance.post<User>(
      api.endpoints.ADMIN_USERS,
      payload,
    );
    return res.data;
  }

  async updateUser(id: string, updates: Record<string, any>): Promise<User> {
    const url = api.endpoints.ADMIN_USER_DETAIL.replace(":id", id);
    const res = await axiosInstance.put<User>(url, updates);
    return res.data;
  }

  async deleteUser(id: string): Promise<void> {
    const url = api.endpoints.ADMIN_USER_DETAIL.replace(":id", id);
    await axiosInstance.delete(url);
  }
}

export default new AdminService();
