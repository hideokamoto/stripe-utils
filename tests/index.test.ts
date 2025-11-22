import { describe, expect, it } from 'vitest';
import type { DeclineCodeInfo } from '../src/index';
import {
  formatDeclineMessage,
  getAllDeclineCodes,
  getDeclineCategory,
  getDeclineDescription,
  getDeclineMessage,
  getDocVersion,
  getMessageFromStripeError,
  isHardDecline,
  isSoftDecline,
  isValidDeclineCode,
} from '../src/index';

describe('getDeclineDescription', () => {
  it('should return empty object if no code is provided', () => {
    const result = getDeclineDescription();
    expect(result.code).toEqual({});
    expect(result.docVersion).toBeTruthy();
  });

  it('should return empty object for invalid code', () => {
    const result = getDeclineDescription('invalid_code');
    expect(result.code).toEqual({});
  });

  it('should return correct information for generic_decline', () => {
    const result = getDeclineDescription('generic_decline');
    expect(result.code).toHaveProperty('description');
    expect(result.code).toHaveProperty('nextSteps');
    expect(result.code).toHaveProperty('nextUserAction');
    if ('description' in result.code) {
      expect(result.code.description).toBe('The card has been declined for an unknown reason.');
    }
  });

  it('should return correct information for insufficient_funds', () => {
    const result = getDeclineDescription('insufficient_funds');
    const code = result.code as DeclineCodeInfo;
    expect(code.description).toBe('The card has insufficient funds to complete the purchase.');
    expect(code.nextUserAction).toBe('Please try again using an alternative payment method.');
  });

  it('should include Japanese translations', () => {
    const result = getDeclineDescription('insufficient_funds');
    const code = result.code as DeclineCodeInfo;
    expect(code.translations).toHaveProperty('ja');
    expect(code.translations?.ja?.description).toBe('カードの購入に必要な資金が不足しています。');
  });
});

describe('getDeclineMessage', () => {
  it('should return English message by default', () => {
    const message = getDeclineMessage('insufficient_funds');
    expect(message).toBe('Please try again using an alternative payment method.');
  });

  it('should return English message when locale is "en"', () => {
    const message = getDeclineMessage('insufficient_funds', 'en');
    expect(message).toBe('Please try again using an alternative payment method.');
  });

  it('should return Japanese message when locale is "ja"', () => {
    const message = getDeclineMessage('insufficient_funds', 'ja');
    expect(message).toBe('別のお支払い方法を使用してもう一度お試しください。');
  });

  it('should return undefined for invalid code', () => {
    const message = getDeclineMessage('invalid_code');
    expect(message).toBeUndefined();
  });
});

describe('getAllDeclineCodes', () => {
  it('should return an array of decline codes', () => {
    const codes = getAllDeclineCodes();
    expect(Array.isArray(codes)).toBe(true);
    expect(codes.length).toBeGreaterThan(0);
  });

  it('should include common decline codes', () => {
    const codes = getAllDeclineCodes();
    expect(codes).toContain('insufficient_funds');
    expect(codes).toContain('generic_decline');
    expect(codes).toContain('expired_card');
    expect(codes).toContain('incorrect_cvc');
  });
});

describe('isValidDeclineCode', () => {
  it('should return true for valid codes', () => {
    expect(isValidDeclineCode('insufficient_funds')).toBe(true);
    expect(isValidDeclineCode('generic_decline')).toBe(true);
    expect(isValidDeclineCode('expired_card')).toBe(true);
  });

  it('should return false for invalid codes', () => {
    expect(isValidDeclineCode('invalid_code')).toBe(false);
    expect(isValidDeclineCode('')).toBe(false);
    expect(isValidDeclineCode('random_string')).toBe(false);
  });
});

describe('getDocVersion', () => {
  it('should return a version string', () => {
    const version = getDocVersion();
    expect(typeof version).toBe('string');
    expect(version.length).toBeGreaterThan(0);
  });

  it('should match the format YYYY-MM-DD', () => {
    const version = getDocVersion();
    expect(version).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('formatDeclineMessage', () => {
  it('should return base message without variables', () => {
    const message = formatDeclineMessage('insufficient_funds');
    expect(message).toBe('Please try again using an alternative payment method.');
  });

  it('should return base message when no variables provided', () => {
    const message = formatDeclineMessage('insufficient_funds', 'en');
    expect(message).toBe('Please try again using an alternative payment method.');
  });

  it('should return Japanese message', () => {
    const message = formatDeclineMessage('insufficient_funds', 'ja');
    expect(message).toBe('別のお支払い方法を使用してもう一度お試しください。');
  });

  it('should replace variables in message template', () => {
    const message = formatDeclineMessage('insufficient_funds', 'en', {
      merchantName: 'Acme Store',
    });
    // Base message doesn't have placeholders, so should remain unchanged
    expect(message).toBe('Please try again using an alternative payment method.');
  });

  it('should return undefined for invalid code', () => {
    const message = formatDeclineMessage('invalid_code');
    expect(message).toBeUndefined();
  });
});

describe('getDeclineCategory', () => {
  it('should return SOFT_DECLINE for soft decline codes', () => {
    expect(getDeclineCategory('insufficient_funds')).toBe('SOFT_DECLINE');
    expect(getDeclineCategory('generic_decline')).toBe('SOFT_DECLINE');
    expect(getDeclineCategory('do_not_honor')).toBe('SOFT_DECLINE');
    expect(getDeclineCategory('try_again_later')).toBe('SOFT_DECLINE');
  });

  it('should return HARD_DECLINE for hard decline codes', () => {
    expect(getDeclineCategory('fraudulent')).toBe('HARD_DECLINE');
    expect(getDeclineCategory('stolen_card')).toBe('HARD_DECLINE');
    expect(getDeclineCategory('lost_card')).toBe('HARD_DECLINE');
    expect(getDeclineCategory('expired_card')).toBe('HARD_DECLINE');
    expect(getDeclineCategory('incorrect_cvc')).toBe('HARD_DECLINE');
    expect(getDeclineCategory('invalid_number')).toBe('HARD_DECLINE');
  });

  it('should return undefined for invalid code', () => {
    expect(getDeclineCategory('invalid_code')).toBeUndefined();
  });
});

describe('isHardDecline', () => {
  it('should return true for hard decline codes', () => {
    expect(isHardDecline('fraudulent')).toBe(true);
    expect(isHardDecline('stolen_card')).toBe(true);
    expect(isHardDecline('expired_card')).toBe(true);
    expect(isHardDecline('incorrect_cvc')).toBe(true);
  });

  it('should return false for soft decline codes', () => {
    expect(isHardDecline('insufficient_funds')).toBe(false);
    expect(isHardDecline('generic_decline')).toBe(false);
    expect(isHardDecline('try_again_later')).toBe(false);
  });

  it('should return false for invalid code', () => {
    expect(isHardDecline('invalid_code')).toBe(false);
  });
});

describe('isSoftDecline', () => {
  it('should return true for soft decline codes', () => {
    expect(isSoftDecline('insufficient_funds')).toBe(true);
    expect(isSoftDecline('generic_decline')).toBe(true);
    expect(isSoftDecline('do_not_honor')).toBe(true);
  });

  it('should return false for hard decline codes', () => {
    expect(isSoftDecline('fraudulent')).toBe(false);
    expect(isSoftDecline('stolen_card')).toBe(false);
    expect(isSoftDecline('expired_card')).toBe(false);
  });

  it('should return false for invalid code', () => {
    expect(isSoftDecline('invalid_code')).toBe(false);
  });
});

describe('getMessageFromStripeError', () => {
  it('should extract message from Stripe card error object', () => {
    const stripeError = {
      type: 'StripeCardError',
      decline_code: 'insufficient_funds',
      message: 'Your card has insufficient funds.',
    };
    const message = getMessageFromStripeError(stripeError);
    expect(message).toBe('Please try again using an alternative payment method.');
  });

  it('should extract Japanese message from Stripe card error object', () => {
    const stripeError = {
      type: 'StripeCardError',
      decline_code: 'insufficient_funds',
      message: 'Your card has insufficient funds.',
    };
    const message = getMessageFromStripeError(stripeError, 'ja');
    expect(message).toBe('別のお支払い方法を使用してもう一度お試しください。');
  });

  it('should handle error without decline_code', () => {
    const stripeError = {
      type: 'StripeCardError',
      message: 'An error occurred.',
    };
    const message = getMessageFromStripeError(stripeError);
    expect(message).toBeUndefined();
  });

  it('should handle non-card errors', () => {
    const stripeError = {
      type: 'StripeAPIError',
      message: 'API error occurred.',
    };
    const message = getMessageFromStripeError(stripeError);
    expect(message).toBeUndefined();
  });

  it('should handle invalid decline code in error', () => {
    const stripeError = {
      type: 'StripeCardError',
      decline_code: 'invalid_code',
      message: 'Some error.',
    };
    const message = getMessageFromStripeError(stripeError);
    expect(message).toBeUndefined();
  });
});
