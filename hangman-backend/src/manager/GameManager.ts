import { TSMap } from "typescript-map";
import { Token } from "../model/Token";
import { Game } from "../data/Game";
import { GameToken } from "../model/GameToken";
import { TokenManager } from "./TokenManager";

export class GameManager {

  private static instance: GameManager;
  private games: TSMap<Token, Game>;

  private constructor() {
    this.games = new TSMap<Token, Game>();
  }

  public static get(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  /**
   * Generates a Game Token, initializes a Game instance and returns given Game
   */
  public create(): Game {
    const token: GameToken = TokenManager.get().generateGameToken();
    const game: Game = new Game().setToken(token);
    this.games.set(token, game);

    return game;
  }

  /**
   * Returns game instance based on token
   * // TODO: Implement check if game exists
   * @param token Game token
   */
  public getByToken(token: GameToken): Game {
    return this.games.get(token);
  }

  public deleteByToken(token: GameToken): boolean {
    if (!this.games.has(token)) {
      return false; // There is no game with given token
    }

    if (this.games.delete(token)) {
      return true;
    } else {
      return false; // TODO: Throw error instead of return false
    }
  }
}
