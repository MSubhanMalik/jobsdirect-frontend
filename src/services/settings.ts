import axiosInstance from "./AxiosService";
import { api } from "@/config/api";
import type { SiteSettings, PageContent } from "@/types/settings";

class SettingsService {
  async getSiteSettings(): Promise<SiteSettings> {
    const res = await axiosInstance.get<SiteSettings>(
      api.endpoints.SITE_SETTINGS,
    );
    return res.data;
  }

  async updateSiteSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
    const res = await axiosInstance.put<SiteSettings>(
      api.endpoints.SITE_SETTINGS,
      updates,
    );
    return res.data;
  }

  async listPages(): Promise<PageContent[]> {
    const res = await axiosInstance.get<PageContent[]>(api.endpoints.PAGES);
    return Array.isArray(res.data) ? res.data : [];
  }

  async getPage(slug: string): Promise<PageContent> {
    const url = api.endpoints.PAGE_DETAIL.replace(":slug", slug);
    const res = await axiosInstance.get<PageContent>(url);
    return res.data;
  }

  async upsertPage(slug: string, content: Partial<PageContent>): Promise<PageContent> {
    const url = api.endpoints.PAGE_DETAIL.replace(":slug", slug);
    const res = await axiosInstance.put<PageContent>(url, content);
    return res.data;
  }

  async removePage(slug: string): Promise<void> {
    const url = api.endpoints.PAGE_DETAIL.replace(":slug", slug);
    await axiosInstance.delete(url);
  }
}

export default new SettingsService();
