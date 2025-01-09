export class SmartMoneyError extends Error {
    constructor(message: string, public readonly code: string) {
        super(message);
        this.name = 'SmartMoneyError';
    }
}

export const ErrorCodes = {
    INVALID_CONFIG: 'INVALID_CONFIG',
    GRPC_CONNECTION_ERROR: 'GRPC_CONNECTION_ERROR',
    TRANSACTION_PARSE_ERROR: 'TRANSACTION_PARSE_ERROR',
} as const; 