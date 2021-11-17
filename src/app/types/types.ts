export interface ErrorInfo {
    errorCode: string;
    message: string;
    fields: ErrorFieldInfo[];
}

export type ErrorFieldInfo = {
    name: string,
    errorCode: string,
    errorMessage: string
};
