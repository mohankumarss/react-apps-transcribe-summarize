/**
 * External API Client
 *
 * Handles API operations for standalone SPA deployment using HTTP requests
 * Supports authentication with MSAL tokens and external Dataverse API calls
 */
import { IApiClient, ApiResponse, PaginatedResponse, ApiRequestConfig, QueryOptions, BatchRequest, BatchResponse } from './api/apiTypes';
export interface ApiClientConfig {
    baseURL: string;
    timeout?: number;
    headers?: Record<string, string>;
}
export declare class ExternalApiClient implements IApiClient {
    private client;
    private authService;
    constructor(config: ApiClientConfig);
    initialize(): Promise<void>;
    private setupInterceptors;
    private getAuthToken;
    private handleUnauthorized;
    get<T>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>>;
    post<T>(url: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>>;
    put<T>(url: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>>;
    patch<T>(url: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>>;
    delete<T>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>>;
    retrieveRecord<T>(entityName: string, id: string, options?: QueryOptions): Promise<ApiResponse<T>>;
    retrieveMultipleRecords<T>(entityName: string, options?: QueryOptions): Promise<PaginatedResponse<T>>;
    createRecord<T>(entityName: string, data: any): Promise<ApiResponse<T>>;
    updateRecord<T>(entityName: string, id: string, data: any): Promise<ApiResponse<T>>;
    deleteRecord(entityName: string, id: string): Promise<ApiResponse<void>>;
    executeFunction<T>(functionName: string, parameters?: any): Promise<ApiResponse<T>>;
    executeBatch(requests: BatchRequest[]): Promise<BatchResponse>;
    private convertConfig;
    private buildQueryString;
    private generateBatchId;
    private generateChangesetId;
    private buildBatchBody;
    private parseBatchResponse;
    private createApiError;
    private handleError;
    private handleErrorPaginated;
}
export declare const configureApiClient: (config: {
    baseUrl?: string;
}) => void;
export declare const apiClient: ExternalApiClient;
//# sourceMappingURL=apiClient.d.ts.map