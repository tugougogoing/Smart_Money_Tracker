import Client, { CommitmentLevel } from '@triton-one/yellowstone-grpc';
import { ENV } from '../../config/env';

export function createGrpcClient() {
    return new Client(
        ENV.GRPC_ENDPOINT,
        ENV.GRPC_OPTIONS || ''
    );
}

export function createSubscribeRequest(addresses: string[]) {
    return {
        accounts: {},
        slots: {},
        transactions: {
            tx: {
                vote: false,
                failed: false,
                signature: undefined,
                accountInclude: addresses,
                accountExclude: [],
                accountRequired: [],
            }
        },
        blocks: {},
        blocksMeta: {},
        entry: {},
        commitment: CommitmentLevel.CONFIRMED,
        accountsDataSlice: [],
        ping: undefined,
    };
} 