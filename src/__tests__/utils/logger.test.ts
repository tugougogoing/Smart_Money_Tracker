import { formatTransactionOutput, TransactionLogData } from '../../utils/logger';

describe('formatTransactionOutput', () => {
    const mockData: TransactionLogData = {
        slot: 12345,
        wallet: 'testWallet123',
        contract: 'Pump',
        type: '买入',
        tokenMint: 'testMint456',
        solAmount: 1.23456,
        tokenAmount: 1000000.789
    };

    it('should format transaction data correctly', () => {
        const output = formatTransactionOutput(mockData);
        expect(output).toContain('交易槽位：12345');
        expect(output).toContain('交易钱包：testWallet123');
        expect(output).toContain('交易合约：Pump');
        expect(output).toContain('交易类型：买入');
        expect(output).toContain('代币地址：testMint456');
        expect(output).toContain('SOL数量：1.23');
        expect(output).toContain('代币数量：1,000,000.79');
    });
}); 