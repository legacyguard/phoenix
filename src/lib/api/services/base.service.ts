import { apiClient, ApiResponse, ApiClientError } from "../client";

export interface BaseServiceConfig {
  endpoint: string;
  timeout?: number;
}

export abstract class BaseService<T = unknown> {
  protected endpoint: string;
  protected timeout: number;

  constructor(config: BaseServiceConfig) {
    this.endpoint = config.endpoint;
    this.timeout = config.timeout || 30000;
  }

  protected async get<R = T>(id: string): Promise<R> {
    const response = await apiClient.get<R>(`${this.endpoint}/${id}`);
    return response.data;
  }

  protected async getAll<R = T[]>(
    params?: Record<string, unknown>,
  ): Promise<R> {
    const response = await apiClient.get<R>(this.endpoint, { params });
    return response.data;
  }

  protected async create<R = T>(data: Partial<T>): Promise<R> {
    const response = await apiClient.post<R>(this.endpoint, data);
    return response.data;
  }

  protected async update<R = T>(id: string, data: Partial<T>): Promise<R> {
    const response = await apiClient.patch<R>(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  protected async delete<R = unknown>(id: string): Promise<R> {
    const response = await apiClient.delete<R>(`${this.endpoint}/${id}`);
    return response.data;
  }

  protected handleError(error: unknown): never {
    if (error instanceof ApiClientError) {
      throw error;
    }
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    throw new ApiClientError(message, "UNKNOWN_ERROR", error);
  }
}

export default BaseService;
