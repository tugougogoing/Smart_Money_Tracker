import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import bs58 from "bs58";
import Client from '@triton-one/yellowstone-grpc';
import { TokenBalance, TransactionData, TokenInfo } from "../types/transaction";
import { WSOL_MINT } from "../config/constants";
import { formatTokenAmount } from "../utils/formatter";
import { formatTransactionOutput } from "../utils/logger";
import { createSubscribeRequest } from "../services/grpc/client";

export class SmartMoneyTracker {
    private client: Client;
    private connection: Connection;
    private addresses: string[];
    private watchedContracts: string[];

    constructor(
        client: Client,
        connection: Connection,
        addresses: string[],
        watchedContracts: string[]
    ) {
        this.client = client;
        this.connection = connection;
        this.addresses = addresses;
        this.watchedContracts = watchedContracts;
    }

    async startTracking() {
        console.log('开始监控聪明钱包...');
        const stream = await this.client.subscribe();
        console.log('GRPC 连接成功！');

        const streamClosedPromise = this.setupStreamListeners(stream);
        await this.subscribeToTransactions(stream);
        await streamClosedPromise;
    }

    private async setupStreamListeners(stream: any) {
        return new Promise<void>((resolve, reject) => {
            stream.on("error", (error: Error) => {
                reject(error);
                stream.end();
            });
            stream.on("end", resolve);
            stream.on("close", resolve);

            stream.on("data", async (data: TransactionData) => {
                if (data.transaction) {
                    const accountKeys = data.transaction.transaction.transaction.message.accountKeys.map((ak: Uint8Array) => bs58.encode(ak));
                    if (this.watchedContracts.some(contract => accountKeys.includes(contract))) {
                        await this.checkBalances(data);
                    }
                }
            });
        });
    }

    private async subscribeToTransactions(stream: any) {
        const request = createSubscribeRequest(this.addresses);
        await new Promise<void>((resolve, reject) => {
            stream.write(request, (err: Error | null | undefined) => {
                if (!err) resolve();
                else reject(err);
            });
        });
    }

    private async checkBalances(data: TransactionData): Promise<TokenInfo | null> {
        const solChange = this.calculateSolChange(data);
        const tokenInfo = await this.checkTokenBalances(data);
        if (!tokenInfo || tokenInfo.mint === WSOL_MINT) {
            return null;
        }

        const output = formatTransactionOutput({
            slot: data.transaction.slot,
            wallet: this.addresses[0],
            contract: this.watchedContracts.includes('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P') ? 'Pump' : 'Raydium',
            type: solChange < 0 ? '买入' : '卖出',
            tokenMint: tokenInfo.mint,
            solAmount: Math.abs(solChange),
            tokenAmount: Math.abs(tokenInfo.amount)
        });

        console.log(output);
        return tokenInfo;
    }

    private calculateSolChange(data: TransactionData): number {
        const preBalance = data.transaction.transaction.meta.preBalances[0];
        const postBalance = data.transaction.transaction.meta.postBalances[0];
        return (postBalance - preBalance) / LAMPORTS_PER_SOL;
    }

    private async checkTokenBalances(data: TransactionData) {
        const preTokenBalances = data.transaction.transaction.meta.preTokenBalances;
        const postTokenBalances = data.transaction.transaction.meta.postTokenBalances;

        if (postTokenBalances.length === 0) {
            return null;
        }

        for (const postBalance of postTokenBalances) {
            if (!this.addresses.includes(postBalance.owner)) continue;
            if (postBalance.mint === WSOL_MINT) continue;
            
            const preBalance = preTokenBalances.find(
                (pre: TokenBalance) => pre.owner === postBalance.owner && pre.mint === postBalance.mint
            )?.uiTokenAmount.uiAmount || 0;
            
            const change = postBalance.uiTokenAmount.uiAmount - preBalance;
            if (change !== 0) {
                return {
                    mint: postBalance.mint,
                    amount: change
                };
            }
        }

        return null;
    }
} 