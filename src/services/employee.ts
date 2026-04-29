import axiosInstance from "./AxiosService";
import { api } from "@/config/api";
import type { Employee, EmployeeCreatePayload, EmployeeUpdatePayload } from "@/types/employee";
import type { ListQuery, PaginatedResponse } from "@/types/api";

class EmployeeService {
  async list(query: ListQuery = {}): Promise<PaginatedResponse<Employee>> {
    const params = new URLSearchParams();
    if (!query.page) params.set("page", "1");
    if (!query.pageSize) params.set("pageSize", "100");
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
    });
    const res = await axiosInstance.get<PaginatedResponse<Employee>>(
      `${api.endpoints.EMPLOYEES}?${params.toString()}`,
    );
    return res.data;
  }

  async getById(id: string): Promise<Employee> {
    const url = api.endpoints.EMPLOYEE_DETAIL.replace(":id", id);
    const res = await axiosInstance.get<Employee>(url);
    return res.data;
  }

  async create(payload: EmployeeCreatePayload): Promise<Employee> {
    const res = await axiosInstance.post<Employee>(
      api.endpoints.EMPLOYEES,
      payload,
    );
    return res.data;
  }

  async update(id: string, updates: EmployeeUpdatePayload): Promise<Employee> {
    const url = api.endpoints.EMPLOYEE_DETAIL.replace(":id", id);
    const res = await axiosInstance.put<Employee>(url, updates);
    return res.data;
  }

  async remove(id: string): Promise<void> {
    const url = api.endpoints.EMPLOYEE_DETAIL.replace(":id", id);
    await axiosInstance.delete(url);
  }
}

export default new EmployeeService();
