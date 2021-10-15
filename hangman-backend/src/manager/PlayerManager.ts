import { TSMap } from "typescript-map";
import { Token } from "../model/Token";
import { PlayerToken } from "../model/PlayerToken";
import { TokenManager } from "./TokenManager";
import { Player } from "../data/Player";

export class PlayerManager {

  private static instance: PlayerManager;
  private players: TSMap<Token, Player>;

  private constructor() {
    this.players = new TSMap<Token, Player>();
  }

  public static get(): PlayerManager {
    if (!PlayerManager.instance) {
      PlayerManager.instance = new PlayerManager();
    }
    return PlayerManager.instance;
  }

  /**
   * Generates a Game Token, initializes a Game instance and returns given Game
   */
  public create(): Player {
    const token: PlayerToken = TokenManager.get().generatePlayerToken();
    const player: Player = new Player().setToken(token);
    this.players.set(token, player);

    return player;
  }

  /**
   * Returns player instance based on token
   * // TODO: Implement check if player exists
   * @param token Player token
   */
  public getByToken(token: PlayerToken): Player {
    return this.players.get(token);
  }

  public deleteByToken(token: PlayerToken): boolean {
    if (!this.players.has(token)) {
      return false; // There is no player with given token
    }

    if (this.players.delete(token)) {
      return true;
    } else {
      return false; // TODO: Throw error instead of return false
    }
  }
}
