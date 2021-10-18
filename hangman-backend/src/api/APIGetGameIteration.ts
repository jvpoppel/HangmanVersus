import {Director} from "../manager/Director";
import {GameToken} from "../model/GameToken";
import {TokenManager} from "../manager/TokenManager";
import {PlayerToken} from "../model/PlayerToken";
import {NullToken} from "../model/NullToken";
import {GameManager} from "../manager/GameManager";

export function apiGetGameIteration(gameToken: string, playerToken: string): string {
  const resolvedPlayer: PlayerToken | NullToken = TokenManager.get().getFromString(playerToken);
  const resolvedGameToken: GameToken | NullToken = TokenManager.get().getFromString(gameToken);

  if (resolvedPlayer.isNullToken() || resolvedGameToken.isNullToken()) {
    return "-1";
  }
  const result: GameToken | undefined = Director.get().checkIfPlayerInGame(<PlayerToken> resolvedPlayer, resolvedGameToken);

  if (result == undefined) {
    return "-1";
  } else {
    const resolvedGame = GameManager.get().getByToken(resolvedGameToken);
    if (resolvedGame === undefined) {
      return "failed";
    }
    return resolvedGame.getIteration() + "";
  }
}
