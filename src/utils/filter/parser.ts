import { Token, ASTNode } from './types.js';

// Recursive descent parser producing AST from tokens
export class Parser {
  private tokens: Token[];
  private pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private consume(): Token {
    return this.tokens[this.pos++];
  }

  public parse(): ASTNode {
    if (this.tokens.length === 0) {
      return { type: 'LITERAL', value: true };
    }
    const node = this.parseOr();
    return node;
  }

  private parseOr(): ASTNode {
    let left = this.parseAnd();
    while (this.peek()?.type === 'OR') {
      this.consume();
      const right = this.parseAnd();
      left = { type: 'LOGICAL', op: '||', left, right };
    }
    return left;
  }

  private parseAnd(): ASTNode {
    let left = this.parseComparison();
    while (this.peek()?.type === 'AND') {
      this.consume();
      const right = this.parseComparison();
      left = { type: 'LOGICAL', op: '&&', left, right };
    }
    return left;
  }

  private parseComparison(): ASTNode {
    const left = this.parsePrimary();
    if (this.peek()?.type === 'OP') {
      const opToken = this.consume();
      const right = this.parsePrimary();
      return { type: 'COMPARISON', op: opToken.value, left, right };
    }
    return left;
  }

  private parsePrimary(): ASTNode {
    const t = this.peek();
    if (!t) throw new Error('Unexpected end of filter string');

    if (t.type === 'LPAREN') {
      this.consume();
      const inner = this.parseOr();
      if (this.peek()?.type !== 'RPAREN') {
        throw new Error('Missing closing parenthesis in filter');
      }
      this.consume();
      return inner;
    }

    if (t.type === 'STRING') {
      this.consume();
      return { type: 'LITERAL', value: t.value };
    }
    if (t.type === 'NUMBER') {
      this.consume();
      return { type: 'LITERAL', value: Number(t.value) };
    }
    if (t.type === 'BOOL') {
      this.consume();
      return { type: 'LITERAL', value: t.value === 'true' };
    }
    if (t.type === 'NULL') {
      this.consume();
      return { type: 'LITERAL', value: null };
    }
    if (t.type === 'IDENT') {
      this.consume();
      return { type: 'IDENTIFIER', value: t.value };
    }

    throw new Error(`Unexpected token '${t.value}' in filter`);
  }
}

