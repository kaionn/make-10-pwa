type OperatorChar = '+' | '-' | '×' | '÷';

type Token =
  | { type: 'Number'; value: number }
  | { type: 'Operator'; value: OperatorChar }
  | { type: 'LeftParen' }
  | { type: 'RightParen' };

const operators = new Set<string>(['+', '-', '×', '÷']);

const tokenize = (expr: string): Token[] => {
  const tokens: Token[] = [];
  for (let i = 0; i < expr.length; i += 1) {
    const ch = expr[i];
    if (ch === ' ' || ch === '\t' || ch === '\n') {
      continue;
    }
    if (ch >= '0' && ch <= '9') {
      tokens.push({ type: 'Number', value: Number(ch) });
      continue;
    }
    if (operators.has(ch)) {
      tokens.push({ type: 'Operator', value: ch as OperatorChar });
      continue;
    }
    if (ch === '(') {
      tokens.push({ type: 'LeftParen' });
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'RightParen' });
      continue;
    }
    throw new Error(`Unexpected character: ${ch}`);
  }
  return tokens;
};

const applyOperator = (left: number, op: OperatorChar, right: number): number => {
  switch (op) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '×':
      return left * right;
    case '÷':
      return right === 0 ? Infinity : left / right;
  }
};

export const evaluate = (expr: string): number => {
  const tokens = tokenize(expr);
  let index = 0;

  const peek = (): Token | undefined => tokens[index];
  const consume = (): Token => {
    const token = tokens[index];
    if (!token) {
      throw new Error('Unexpected end of expression');
    }
    index += 1;
    return token;
  };

  const parseExpression = (): number => {
    let value = parseTerm();
    while (true) {
      const token = peek();
      if (token?.type === 'Operator' && (token.value === '+' || token.value === '-')) {
        consume();
        value = applyOperator(value, token.value, parseTerm());
        continue;
      }
      break;
    }
    return value;
  };

  const parseTerm = (): number => {
    let value = parseFactor();
    while (true) {
      const token = peek();
      if (token?.type === 'Operator' && (token.value === '×' || token.value === '÷')) {
        consume();
        value = applyOperator(value, token.value, parseFactor());
        continue;
      }
      break;
    }
    return value;
  };

  const parseFactor = (): number => {
    const token = consume();
    if (token.type === 'Number') {
      return token.value;
    }
    if (token.type === 'LeftParen') {
      const value = parseExpression();
      const next = consume();
      if (next.type !== 'RightParen') {
        throw new Error('Missing closing parenthesis');
      }
      return value;
    }
    throw new Error('Unexpected token');
  };

  const result = parseExpression();
  if (index < tokens.length) {
    throw new Error('Unexpected trailing tokens');
  }
  return result;
};
