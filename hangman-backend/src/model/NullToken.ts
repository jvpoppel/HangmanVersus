import {Token, TokenType} from "./Token";

export class NullToken implements Token {

  constructor() {
    this.token = "";
    this.type = TokenType.NULL;
  }
  token: string;
  type: TokenType;

  getToken(): string {
    return "";
  }

  isGameToken(): boolean {
    return this.type == TokenType.GAME;
  }

  isNullToken(): boolean {
    return this.type == TokenType.NULL;
  }

  isPlayerToken(): boolean {
    return this.type == TokenType.PLAYER;
  }
}
