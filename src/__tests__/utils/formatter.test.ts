import { formatTokenAmount } from '../../utils/formatter';

describe('formatTokenAmount', () => {
    it('should format numbers with correct decimals', () => {
        expect(formatTokenAmount(1234.5678)).toBe('1,234.57');
        expect(formatTokenAmount(0.123456)).toBe('0.12');
        expect(formatTokenAmount(1000000)).toBe('1,000,000.00');
    });

    it('should handle zero', () => {
        expect(formatTokenAmount(0)).toBe('0.00');
    });

    it('should handle negative numbers', () => {
        expect(formatTokenAmount(-1234.5678)).toBe('-1,234.57');
    });
}); 