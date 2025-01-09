import { SmartMoneyError, ErrorCodes } from '../../utils/error';

describe('SmartMoneyError', () => {
    it('should create error with code', () => {
        const error = new SmartMoneyError('test error', ErrorCodes.INVALID_CONFIG);
        expect(error.message).toBe('test error');
        expect(error.code).toBe('INVALID_CONFIG');
        expect(error.name).toBe('SmartMoneyError');
    });
}); 