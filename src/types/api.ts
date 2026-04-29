export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  status: number;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ListQuery {
  [key: string]: string | number | boolean | undefined;
}
