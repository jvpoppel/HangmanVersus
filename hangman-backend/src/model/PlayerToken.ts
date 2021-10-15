import {Token, TokenType} from "./Token";

export class PlayerToken implements Token {
  token: string;
  uuid: string;
  type: TokenType;

  constructor(token: string, uuid: string) {
    this.token = token;
    this.type = TokenType.PLAYER;
    this.uuid = uuid;
  }

  public checkUuid(supposedUUID: string): boolean {
    return supposedUUID === this.uuid;
  }

  public getUUID(): string {
    return this.uuid;
  }

  public getToken(): string {
    return this.token;
  }


  public toString(): string {
    return this.token;
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
