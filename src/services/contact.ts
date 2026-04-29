import axiosInstance from "./AxiosService";
import { api } from "@/config/api";
import type { ContactMessage } from "@/types/settings";

interface ContactPayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

class ContactService {
  async create(payload: ContactPayload): Promise<ContactMessage> {
    const res = await axiosInstance.post<ContactMessage>(
      api.endpoints.CONTACT,
      payload,
    );
    return res.data;
  }

  async list(query: Record<string, any> = {}): Promise<ContactMessage[]> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) params.set(key, String(value));
    });
    const qs = params.toString();
    const res = await axiosInstance.get<ContactMessage[]>(
      `${api.endpoints.CONTACT}${qs ? `?${qs}` : ""}`,
    );
    return Array.isArray(res.data) ? res.data : [];
  }

  async getById(id: string): Promise<ContactMessage> {
    const res = await axiosInstance.get<ContactMessage>(
      `${api.endpoints.CONTACT}/${id}`,
    );
    return res.data;
  }

  async update(id: string, updates: Partial<ContactMessage>): Promise<ContactMessage> {
    const res = await axiosInstance.put<ContactMessage>(
      `${api.endpoints.CONTACT}/${id}`,
      updates,
    );
    return res.data;
  }

  async remove(id: string): Promise<void> {
    await axiosInstance.delete(`${api.endpoints.CONTACT}/${id}`);
  }
}

export default new ContactService();
