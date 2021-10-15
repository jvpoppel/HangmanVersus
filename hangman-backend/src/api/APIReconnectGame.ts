import {GameToken} from "../model/GameToken";
import {TokenManager} from "../manager/TokenManager";
import {Token} from "../model/Token";
import {Director} from "../manager/Director";
import {getLogger} from "../endpoint";
import {PlayerToken} from "../model/PlayerToken";

export function apiReconnectGame(playerToken: string, gameToken: string): string | undefined {

  const resolvedPlayerToken: Token = TokenManager.get().getFromString(playerToken);
  getLogger().debug("[APIReconnectGame] Given string " + playerToken + ", we resolved playertoken " + resolvedPlayerToken.getToken());

  const resolvedGameToken: Token = TokenManager.get().getFromString(gameToken);
  getLogger().debug("[APIReconnectGame] Given string " + gameToken + ", we resolved gametoken " + resolvedGameToken.getToken());

  if (!resolvedPlayerToken.isPlayerToken()) {
    getLogger().debug("[APIReconnectGame] PlayerToken not an instance of PlayerToken ( " + resolvedPlayerToken.isPlayerToken() + ", " + resolvedPlayerToken.type + ")");
    return undefined; // No player on given token
  }
  if (!resolvedGameToken.isGameToken()) {
    getLogger().debug("[APIReconnectGame] GameToken not an instance of GameToken (" + resolvedGameToken.isGameToken() + ", " + resolvedGameToken.type + ")");
    return undefined; // No game on given token
  }

  const toReturn: GameToken | undefined = Director.get().checkIfPlayerInGame(<PlayerToken> resolvedPlayerToken, resolvedGameToken);
  if (toReturn == undefined) {
    getLogger().debug("[APIReconnectGame] Director returned undefined");
    return undefined;
  }
  return toReturn.getToken();
}
