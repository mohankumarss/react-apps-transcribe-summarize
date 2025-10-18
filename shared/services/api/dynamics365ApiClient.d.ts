/**
 * Dynamics 365 API Client
 *
 * Handles API operations within Dynamics 365 web resource context using Xrm.WebApi
 */
import { IApiClient, ApiResponse, PaginatedResponse, ApiRequestConfig, QueryOptions, BatchRequest, BatchResponse } from './apiTypes';
export declare class Dynamics365ApiClient implements IApiClient {
    private xrmWebApi;
    initialize(): Promise<void>;
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
    private waitForXrmContext;
    private ensureInitialized;
    private buildQueryString;
    private extractEntityNameFromUrl;
    private parseEntityUrl;
    private handleError;
    private handleErrorPaginated;
}
//# sourceMappingURL=dynamics365ApiClient.d.ts.map