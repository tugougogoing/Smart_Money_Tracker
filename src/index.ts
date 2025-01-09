import { ENV } from './config/env';
import { createGrpcClient } from './services/grpc/client';
import { createSolanaConnection } from './services/solana/connection';
import { SmartMoneyTracker } from './core/SmartMoneyTracker';
import { CONTRACTS } from './config/constants';

export async function main() {
    const client = createGrpcClient();
    const connection = createSolanaConnection();

    const tracker = new SmartMoneyTracker(
        client,
        connection,
        ENV.SMART_MONEY_ADDRESSES,
        [CONTRACTS.PUMP, CONTRACTS.RAYDIUM]
    );

    await tracker.startTracking();
}

main().catch(console.error); 