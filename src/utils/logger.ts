import { formatTokenAmount } from './formatter';

export interface TransactionLogData {
    slot: number;
    wallet: string;
    contract: string;
    type: string;
    tokenMint: string;
    solAmount: number;
    tokenAmount: number;
}

export function formatTransactionOutput(data: TransactionLogData): string {
    return [
        `交易钱包：\`${data.wallet}\``,
        `交易合约：${data.contract}`,
        `交易类型：${data.type}`,
        `代币地址：\`${data.tokenMint}\``,
        `SOL数量：${formatTokenAmount(Math.abs(data.solAmount))}`,
        `代币数量：${formatTokenAmount(Math.abs(data.tokenAmount))}`,
    ].join('\n');
} 