export type ValidationResult = { valid: boolean; error?: string };

const operators = new Set(['+', '-', '×', '÷']);

const extractDigits = (expr: string): number[] => {
  const digits: number[] = [];
  for (const ch of expr) {
    if (ch >= '0' && ch <= '9') {
      digits.push(Number(ch));
    }
  }
  return digits;
};

const hasValidParentheses = (expr: string): boolean => {
  let depth = 0;
  for (const ch of expr) {
    if (ch === '(') {
      depth += 1;
    } else if (ch === ')') {
      depth -= 1;
      if (depth < 0) {
        return false;
      }
    }
  }
  return depth === 0;
};

const hasConsecutiveOperators = (expr: string): boolean => {
  let previousWasOperator = false;
  for (const ch of expr) {
    if (ch === ' ' || ch === '\t' || ch === '\n') {
      continue;
    }
    if (operators.has(ch)) {
      if (previousWasOperator) {
        return true;
      }
      previousWasOperator = true;
      continue;
    }
    if (ch === '(' || ch === ')') {
      previousWasOperator = false;
      continue;
    }
    if (ch >= '0' && ch <= '9') {
      previousWasOperator = false;
    }
  }
  return false;
};

export const validateExpression = (
  expr: string,
  givenNumbers: number[]
): ValidationResult => {
  const trimmed = expr.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Expression is empty.' };
  }

  const digits = extractDigits(expr).sort((a, b) => a - b);
  const expected = [...givenNumbers].sort((a, b) => a - b);
  if (digits.length !== expected.length) {
    return { valid: false, error: 'Numbers do not match the given set.' };
  }
  for (let i = 0; i < expected.length; i += 1) {
    if (digits[i] !== expected[i]) {
      return { valid: false, error: 'Numbers do not match the given set.' };
    }
  }

  if (!hasValidParentheses(expr)) {
    return { valid: false, error: 'Parentheses are not balanced.' };
  }

  if (hasConsecutiveOperators(expr)) {
    return { valid: false, error: 'Operators cannot be consecutive.' };
  }

  return { valid: true };
};
