import { describe, expect, it } from 'vitest';
import { validateExpression } from '../validator';

describe('validateExpression', () => {
  it('accepts valid expressions', () => {
    const result = validateExpression('1+2+3+4', [1, 2, 3, 4]);
    expect(result.valid).toBe(true);
  });

  it('rejects missing numbers', () => {
    const result = validateExpression('1+2+3', [1, 2, 3, 4]);
    expect(result.valid).toBe(false);
  });

  it('rejects extra numbers', () => {
    const result = validateExpression('1+2+3+4+5', [1, 2, 3, 4]);
    expect(result.valid).toBe(false);
  });

  it('rejects mismatched parentheses', () => {
    const result = validateExpression('(1+2', [1, 2]);
    expect(result.valid).toBe(false);
  });
});
