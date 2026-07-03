
export type RequestType = 'read' | 'update' | 'create' | 'delete';

export interface UpdateRequest {
    object?: any;
    tableName: string;
    id?: number;
}

export interface UpdateResponse {
    status?: 'success' | 'failed';
    reason?: string;
    payload?: any;
}