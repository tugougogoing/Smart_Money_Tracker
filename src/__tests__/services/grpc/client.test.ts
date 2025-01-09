import { createGrpcClient, createSubscribeRequest } from '../../../services/grpc/client';
import { ENV } from '../../../config/env';

describe('GRPC Client', () => {
    it('should create client with correct config', () => {
        const client = createGrpcClient();
        expect(client).toBeDefined();
    });

    it('should create subscribe request with correct format', () => {
        const addresses = ['addr1', 'addr2'];
        const request = createSubscribeRequest(addresses);

        expect(request.transactions.tx.vote).toBe(false);
        expect(request.transactions.tx.failed).toBe(false);
        expect(request.transactions.tx.accountInclude).toEqual(addresses);
        expect(request.transactions.tx.accountExclude).toEqual([]);
        expect(request.transactions.tx.accountRequired).toEqual([]);
    });
}); 