import { Connection } from '@solana/web3.js';
import { ENV } from '../../config/env';

export function createSolanaConnection() {
    return new Connection(ENV.RPC_ENDPOINT);
} 