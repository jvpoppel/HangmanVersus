import {GameToken} from "../model/GameToken";
import {TokenManager} from "../manager/TokenManager";
import {Token} from "../model/Token";
import {GameManager} from "../manager/GameManager";
import {Director} from "../manager/Director";
import {getLogger} from "../endpoint";

export function apiJoinGame(gameToken: string, playerName: string): string | undefined {

  const resolvedGameToken: Token = TokenManager.get().getFromString(gameToken);
  if (!(resolvedGameToken instanceof GameToken)) {
    getLogger().debug("[APIJoinGame] Resolved game token not instance of GameToken");
    return undefined; // No game on given token
  }

  const resolvedGame = GameManager.get().getByToken(resolvedGameToken);
  if (resolvedGame === undefined) {
    return "failed";
  }

  if (!resolvedGame.playerCanJoin()) {
    getLogger().debug("[APIJoinGame] Resolved game is not joinable");
    return undefined; // Game already started
  }

  return Director.get().joinGameForPlayer(resolvedGameToken, playerName);
}
