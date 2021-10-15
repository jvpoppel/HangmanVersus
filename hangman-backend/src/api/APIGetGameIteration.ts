import {Director} from "../manager/Director";
import {GameToken} from "../model/GameToken";
import {TokenManager} from "../manager/TokenManager";
import {PlayerToken} from "../model/PlayerToken";
import {NullToken} from "../model/NullToken";
import {GameManager} from "../manager/GameManager";

export function apiGetGameIteration(gameToken: string, playerToken: string): string {
  const resolvedPlayer: PlayerToken | NullToken = TokenManager.get().getFromString(playerToken);
  const resolvedGame: GameToken | NullToken = TokenManager.get().getFromString(gameToken);

  if (resolvedPlayer.isNullToken() || resolvedGame.isNullToken()) {
    return "-1";
  }
  const result: GameToken | undefined = Director.get().checkIfPlayerInGame(<PlayerToken> resolvedPlayer, resolvedGame);
  if (result == undefined) {
    return "-1";
  } else {
    return GameManager.get().getByToken(result).getIteration() + "";
  }
}
