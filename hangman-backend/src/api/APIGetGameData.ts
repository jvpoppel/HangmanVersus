import {GameToken} from "../model/GameToken";
import {TokenManager} from "../manager/TokenManager";
import {PlayerToken} from "../model/PlayerToken";
import {NullToken} from "../model/NullToken";
import {GameManager} from "../manager/GameManager";
import {GameData} from "../data/GameData";

export function apiGetGameData(gameToken: string, playerToken: string, iteration: number): any {
  const resolvedPlayer: PlayerToken | NullToken = TokenManager.get().getFromString(playerToken);
  const resolvedGameToken: GameToken | NullToken = TokenManager.get().getFromString(gameToken);

  if (resolvedPlayer.isNullToken() || resolvedGameToken.isNullToken()) {
    return "failed";
  }

  const resolvedGame = GameManager.get().getByToken(resolvedGameToken);
  if (resolvedGame === undefined) {
    return "failed";
  }

  if (iteration == resolvedGame.getIteration()) {
    return "notChanged";
  }

  const result: string = GameData.convert(resolvedGameToken, <PlayerToken> resolvedPlayer);
  if (result === "failed") { // If statement doesn't add much for now, implemented for later expansion.
    return "failed";
  }
  return result;
}
