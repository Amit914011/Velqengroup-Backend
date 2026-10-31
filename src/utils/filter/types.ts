export interface MacroContext {
  auth?: {
    id?: string;
    role?: string;
    email?: string;
    department?: string;
    [key: string]: any;
  } | null;
  body?: Record<string, any>;
  query?: Record<string, any>;
  method?: string;
}

export type TokenType =
  | 'LPAREN'
  | 'RPAREN'
  | 'AND'
  | 'OR'
  | 'OP'
  | 'IDENT'
  | 'STRING'
  | 'NUMBER'
  | 'BOOL'
  | 'NULL';

export interface Token {
  type: TokenType;
  value: string;
}

export type ASTNode =
  | { type: 'LOGICAL'; op: '&&' | '||'; left: ASTNode; right: ASTNode }
  | { type: 'COMPARISON'; op: string; left: ASTNode; right: ASTNode }
  | { type: 'IDENTIFIER'; value: string }
  | { type: 'LITERAL'; value: any };

