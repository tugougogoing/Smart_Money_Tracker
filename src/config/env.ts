import 'dotenv/config';

export const ENV = {
    RPC_ENDPOINT: process.env.RPC_ENDPOINT || 'http://localhost:8899',
    GRPC_ENDPOINT: process.env.GRPC_ENDPOINT || '',
    GRPC_OPTIONS: process.env.GRPC_OPTIONS || '',
    SMART_MONEY_ADDRESSES: (process.env.SMART_MONEY_ADDRESSES || '').split(',').filter(Boolean)
};

// 验证必要的环境变量
if (!ENV.GRPC_ENDPOINT || ENV.SMART_MONEY_ADDRESSES.length === 0) {
    throw new Error('Missing required environment variables');
} 