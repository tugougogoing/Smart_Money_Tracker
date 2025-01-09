import { SmartMoneyTracker } from '../../core/SmartMoneyTracker';
import { createGrpcClient } from '../../services/grpc/client';
import { createSolanaConnection } from '../../services/solana/connection';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { WSOL_MINT } from '../../config/constants';
import { TokenInfo } from '../../types/transaction';

jest.mock('../../services/grpc/client');
jest.mock('../../services/solana/connection');

describe('SmartMoneyTracker', () => {
    const mockClient = {
        subscribe: jest.fn().mockResolvedValue({
            on: jest.fn(),
            write: jest.fn()
        })
    };

    const mockConnection = {
        getSlot: jest.fn().mockResolvedValue(12345)
    };

    beforeEach(() => {
        (createGrpcClient as jest.Mock).mockReturnValue(mockClient);
        (createSolanaConnection as jest.Mock).mockReturnValue(mockConnection);
    });

    it('should filter out wSOL transactions', async () => {
        const tracker = new SmartMoneyTracker(
            mockClient as any,
            mockConnection as any,
            ['testWallet'],
            ['testContract']
        );

        const mockData = {
            transaction: {
                slot: 12345,
                transaction: {
                    signature: new Uint8Array(),
                    transaction: {
                        message: {
                            accountKeys: [new Uint8Array()],
                            instructions: []
                        }
                    },
                    meta: {
                        preBalances: [1000, 0],
                        postBalances: [900, 100],
                        preTokenBalances: [],
                        postTokenBalances: [{
                            accountIndex: 1,
                            mint: WSOL_MINT,
                            uiTokenAmount: {
                                uiAmount: 0.1,
                                decimals: 9,
                                amount: '100000000',
                                uiAmountString: '0.1'
                            },
                            owner: 'testWallet',
                            programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
                        }]
                    }
                }
            }
        };

        // @ts-ignore - private method
        const result = await tracker.checkBalances(mockData);
        expect(result).toBeNull();
    });

    it('should handle transaction subscription', async () => {
        const stream = {
            on: jest.fn().mockImplementation((event, callback) => {
                if (event === 'close') {
                    // 延迟触发关闭事件
                    process.nextTick(() => callback());
                }
                return stream;
            }),
            write: jest.fn().mockImplementation((_, cb) => cb()),
            end: jest.fn()
        };
        mockClient.subscribe.mockResolvedValue(stream);

        const tracker = new SmartMoneyTracker(
            mockClient as any,
            mockConnection as any,
            ['testWallet'],
            ['testContract']
        );

        await tracker.startTracking();
        expect(mockClient.subscribe).toHaveBeenCalled();
    });

    it('should handle stream errors', async () => {
        const errorStream = {
            on: jest.fn().mockImplementation((event, callback) => {
                if (event === 'error') {
                    process.nextTick(() => callback(new Error('Test error')));
                }
                if (event === 'close') {
                    // 不触发关闭事件
                }
                return errorStream;
            }),
            write: jest.fn().mockImplementation((_, cb) => cb()),
            end: jest.fn()
        };

        mockClient.subscribe.mockResolvedValue(errorStream);
        const tracker = new SmartMoneyTracker(
            mockClient as any,
            mockConnection as any,
            ['testWallet'],
            ['testContract']
        );

        await expect(tracker.startTracking()).rejects.toThrow('Test error');
    });

    it('should handle normal token transactions', async () => {
        const tracker = new SmartMoneyTracker(
            mockClient as any,
            mockConnection as any,
            ['testWallet'],
            ['testContract']
        );

        const mockData = {
            transaction: {
                slot: 12345,
                transaction: {
                    signature: new Uint8Array(),
                    transaction: {
                        message: {
                            accountKeys: [new Uint8Array()],
                            instructions: []
                        }
                    },
                    meta: {
                        preBalances: [1000000000, 0],
                        postBalances: [900000000, 100000000],
                        preTokenBalances: [],
                        postTokenBalances: [{
                            accountIndex: 1,
                            mint: 'TestTokenMint123',
                            uiTokenAmount: {
                                uiAmount: 100,
                                decimals: 9,
                                amount: '100000000000',
                                uiAmountString: '100'
                            },
                            owner: 'testWallet',
                            programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
                        }]
                    }
                }
            }
        };

        // @ts-ignore - private method
        const result = await tracker.checkBalances(mockData) as TokenInfo;
        expect(result).toBeDefined();
        expect(result.mint).toBe('TestTokenMint123');
        expect(result.amount).toBe(100);
    });

    it('should handle stream data events', async () => {
        const mockData = {
            transaction: {
                slot: 12345,
                transaction: {
                    signature: new Uint8Array(),
                    transaction: {
                        message: {
                            accountKeys: [Buffer.from('testContract')],
                            instructions: []
                        }
                    },
                    meta: {
                        preBalances: [1000000000],
                        postBalances: [900000000],
                        preTokenBalances: [],
                        postTokenBalances: []
                    }
                }
            }
        };

        const dataStream = {
            on: jest.fn().mockImplementation((event, callback) => {
                if (event === 'data') {
                    // 延迟触发数据事件
                    setTimeout(() => callback(mockData), 0);
                }
                if (event === 'close') {
                    // 在数据事件后关闭流
                    setTimeout(() => callback(), 10);
                }
                return dataStream;
            }),
            write: jest.fn().mockImplementation((_, cb) => cb())
        };

        mockClient.subscribe.mockResolvedValue(dataStream);
        const tracker = new SmartMoneyTracker(
            mockClient as any,
            mockConnection as any,
            ['testWallet'],
            ['testContract']
        );

        await tracker.startTracking();
        expect(dataStream.on).toHaveBeenCalledWith('data', expect.any(Function));
    });

    it('should handle stream close events', async () => {
        const closeStream = {
            on: jest.fn().mockImplementation((event, callback) => {
                if (event === 'close') {
                    // 立即关闭流
                    process.nextTick(() => callback());
                }
                return closeStream;
            }),
            write: jest.fn().mockImplementation((_, cb) => cb())
        };

        mockClient.subscribe.mockResolvedValue(closeStream);
        const tracker = new SmartMoneyTracker(
            mockClient as any,
            mockConnection as any,
            ['testWallet'],
            ['testContract']
        );

        await tracker.startTracking();
    });

    it('should handle empty token balances', async () => {
        const tracker = new SmartMoneyTracker(
            mockClient as any,
            mockConnection as any,
            ['testWallet'],
            ['testContract']
        );

        const mockData = {
            transaction: {
                slot: 12345,
                transaction: {
                    signature: new Uint8Array(),
                    transaction: {
                        message: {
                            accountKeys: [new Uint8Array()],
                            instructions: []
                        }
                    },
                    meta: {
                        preBalances: [1000000000],
                        postBalances: [900000000],
                        preTokenBalances: [],
                        postTokenBalances: []
                    }
                }
            }
        };

        // @ts-ignore - private method
        const result = await tracker.checkBalances(mockData);
        expect(result).toBeNull();
    });

    it('should calculate SOL change correctly', async () => {
        const tracker = new SmartMoneyTracker(
            mockClient as any,
            mockConnection as any,
            ['testWallet'],
            ['testContract']
        );

        const mockData = {
            transaction: {
                slot: 12345,
                transaction: {
                    signature: new Uint8Array(),
                    transaction: {
                        message: {
                            accountKeys: [new Uint8Array()],
                            instructions: []
                        }
                    },
                    meta: {
                        preBalances: [2_000_000_000],
                        postBalances: [1_000_000_000],
                        preTokenBalances: [],
                        postTokenBalances: []
                    }
                }
            }
        };

        // @ts-ignore - private method
        const solChange = tracker.calculateSolChange(mockData);
        expect(solChange).toBe(-1); // 损失了1个SOL
    });
}); 