import axiosInstance from "./AxiosService";
import { api } from "@/config/api";

class TeamService {
  async list(): Promise<any[]> {
    const res = await axiosInstance.get(api.endpoints.TEAM);
    return Array.isArray(res.data) ? res.data : [];
  }

  async invite(email: string, role: string): Promise<any> {
    const res = await axiosInstance.post(api.endpoints.TEAM_INVITE, { email, role });
    return res.data;
  }

  async acceptInvite(token: string): Promise<any> {
    const res = await axiosInstance.post(api.endpoints.TEAM_ACCEPT_INVITE, { token });
    return res.data;
  }

  async updateRole(id: string, role: string): Promise<any> {
    const url = api.endpoints.TEAM_MEMBER_ROLE.replace(":id", id);
    const res = await axiosInstance.put(url, { role });
    return res.data;
  }

  async remove(id: string): Promise<void> {
    await axiosInstance.delete(`${api.endpoints.TEAM}/${id}`);
  }
}

export default new TeamService();
