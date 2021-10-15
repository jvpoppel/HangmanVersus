export interface Token {
  token: string;
  type: TokenType;

  getToken(): string;

  toString(): string;

  isGameToken(): boolean;
  isPlayerToken(): boolean;
  isNullToken(): boolean;
}

export enum TokenType {
  GAME,
  PLAYER,
  NULL
}
