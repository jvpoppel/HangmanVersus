import {TokenBuilder} from "./TokenBuilder";
import {PlayerToken} from "../model/PlayerToken";
import {GameRole} from "../model/GameRole";
import {NullToken} from "../model/NullToken";

export class Player {

  private token: PlayerToken | NullToken;
  private name: string;
  private role: GameRole;
  private alive: boolean;

  constructor() {
    this.token = TokenBuilder.nullToken();
    this.name = "Player";
    this.role = GameRole.UNDECIDED;
    this.alive = true;
  }

  public getName(): string {
    return this.name;
  }

  public getRole(): GameRole {
    return this.role;
  }

  public getToken(): PlayerToken {
    if (this.token instanceof NullToken) {
      throw new Error("Player has no token assigned");
    }
    return this.token;
  }

  public isAlive(): boolean {
    return this.alive;
  }

  public setDead(): Player {
    this.alive = false;
    return this;
  }

  public setName(name: string): Player {
    this.name = name;
    return this;
  }

  public setRole(role: GameRole): Player {
    this.role = role;
    return this;
  }

  public setToken(token: PlayerToken): Player {
    this.token = token;
    return this;
  }
}
