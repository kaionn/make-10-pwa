import { describe, expect, it } from 'vitest';
import { evaluate } from '../parser';

describe('evaluate', () => {
  it('handles basic arithmetic', () => {
    expect(evaluate('1+2')).toBe(3);
    expect(evaluate('3×4')).toBe(12);
    expect(evaluate('8÷2')).toBe(4);
    expect(evaluate('5-3')).toBe(2);
  });

  it('handles parentheses', () => {
    expect(evaluate('(1+2)×3')).toBe(9);
    expect(evaluate('1+(2×3)')).toBe(7);
  });

  it('handles division precision', () => {
    expect(evaluate('8÷3')).toBeCloseTo(8 / 3, 5);
  });

  it('returns Infinity for divide by zero', () => {
    expect(evaluate('1÷0')).toBe(Infinity);
  });

  it('respects operator precedence', () => {
    expect(evaluate('2+3×4')).toBe(14);
  });
});
