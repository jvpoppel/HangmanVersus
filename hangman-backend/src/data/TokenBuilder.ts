import {PlayerToken} from "../model/PlayerToken";
import {GameToken} from "../model/GameToken";
import {NullToken} from "../model/NullToken";

export class TokenBuilder {

  private token: string;
  private uuid: string;

  constructor() {
    this.token = "";
    this.uuid = "";
  }

  public setToken(token: string): TokenBuilder {
    this.token = token;
    return this;
  }

  public setUUID(uuid: string): TokenBuilder {
    this.uuid = uuid;
    return this;
  }

  public forPlayer(): PlayerToken {
    if (this.uuid === "") {
      throw new Error("No UUID specified for player");
    }
    return new PlayerToken(this.token, this.uuid);
  }

  public forGame(): GameToken {
    return new GameToken(this.token);
  }

  public static nullToken(): NullToken {
    return new NullToken();
  }

}
