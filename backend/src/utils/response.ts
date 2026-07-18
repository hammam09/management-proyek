export interface successResponse<T> {
    status: string;
    message: string;
    data: T;
    meta?: Meta;
}

export interface Meta {
    total: number;
    page: number;
    limit: number;
}

export interface fieldError {
    field: string;
    message: string;
}

export interface ErrorResponse {
    status: string;
    message: string;
    errors?: fieldError[];
}

export function successResponse<T>(
    data: T,
    message: string,
    meta?: Meta,
): successResponse<T> {
    const response: successResponse<T> = { status: "succes", message, data };
    if (meta) response.meta = meta;
    return response;
}

export function errorResponse(
    message: string,
    errors?: fieldError[]
): ErrorResponse {
    const response: ErrorResponse = { status: "error", message };
    if (errors) response.errors = errors;
    return response;
}