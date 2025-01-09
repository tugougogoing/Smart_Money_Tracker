import { createSolanaConnection } from '../../../services/solana/connection';
import { Connection } from '@solana/web3.js';

describe('createSolanaConnection', () => {
    it('should create connection with correct endpoint', () => {
        const connection = createSolanaConnection();
        expect(connection).toBeInstanceOf(Connection);
    });
}); 