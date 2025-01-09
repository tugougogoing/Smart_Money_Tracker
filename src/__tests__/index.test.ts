jest.mock('../services/grpc/client');
jest.mock('../services/solana/connection');

const mockStream = {
    on: jest.fn().mockImplementation((event, callback) => {
        if (event === 'close') {
            process.nextTick(() => callback());
        }
        return mockStream;
    }),
    write: jest.fn().mockImplementation((_, cb) => cb())
};

const mockClient = {
    subscribe: jest.fn().mockResolvedValue(mockStream)
};

jest.mock('../services/grpc/client', () => ({
    createGrpcClient: () => mockClient,
    createSubscribeRequest: jest.fn().mockImplementation((addresses) => ({
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
        commitment: 'confirmed',
        accountsDataSlice: [],
        ping: undefined,
    }))
}));

describe('Main', () => {
    it('should initialize and start tracking', async () => {
        const main = (await import('../index')).main;
        await expect(main()).resolves.not.toThrow();
    });
}); 