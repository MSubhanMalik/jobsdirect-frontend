import axiosInstance from "./AxiosService";
import { api } from "@/config/api";

class MessageApiService {
  async getRooms(): Promise<any[]> {
    const res = await axiosInstance.get(api.endpoints.MESSAGE_ROOMS);
    return Array.isArray(res.data) ? res.data : [];
  }

  async createRoom(applicationId: string, employerId: string, candidateId: string): Promise<any> {
    const res = await axiosInstance.post(api.endpoints.MESSAGE_ROOMS, {
      applicationId, employerId, candidateId,
    });
    return res.data;
  }

  async getMessages(roomId: string, page = 1): Promise<any> {
    const url = api.endpoints.MESSAGE_DETAIL.replace(":roomId", roomId);
    const res = await axiosInstance.get(`${url}?page=${page}`);
    return res.data;
  }
}

export default new MessageApiService();
