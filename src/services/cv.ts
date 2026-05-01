import axiosInstance from "./AxiosService";
import { api } from "@/config/api";

class CVService {
  async list(): Promise<any> {
    const res = await axiosInstance.get(api.endpoints.CVS);
    return res.data; // { cvs: [], plan: string, limits: {} }
  }

  async upload(file: File, name?: string): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    if (name) formData.append("name", name);
    const res = await axiosInstance.post(api.endpoints.CV_UPLOAD, formData);
    return res.data;
  }

  async generate(opts?: { cvId?: string; templateId?: string }): Promise<any> {
    const res = await axiosInstance.post(api.endpoints.CV_GENERATE, opts || {});
    return res.data;
  }

  async updateContent(id: string, data: Record<string, any>): Promise<any> {
    const res = await axiosInstance.put(`${api.endpoints.CVS}/${id}/content`, data);
    return res.data;
  }

  async download(id: string): Promise<{ url: string; fileName: string; mimeType: string }> {
    const url = `${api.endpoints.CVS}/${id}/download`;
    const res = await axiosInstance.get(url);
    return res.data;
  }

  async setDefault(id: string): Promise<any> {
    const url = api.endpoints.CV_DEFAULT.replace(":id", id);
    const res = await axiosInstance.put(url);
    return res.data;
  }

  async remove(id: string): Promise<void> {
    await axiosInstance.delete(`${api.endpoints.CVS}/${id}`);
  }
}

export default new CVService();
