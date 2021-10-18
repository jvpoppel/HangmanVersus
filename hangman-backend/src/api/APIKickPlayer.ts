import {PlayerToken} from "../model/PlayerToken";
import {NullToken} from "../model/NullToken";
import {TokenManager} from "../manager/TokenManager";
import {GameToken} from "../model/GameToken";
import {Director} from "../manager/Director";
import {GameManager} from "../manager/GameManager";
import {getLogger} from "../endpoint";

export function apiKickPlayer(playerToKick: string, supposedHost: string, gameToken: string): string {
  const resolvedPlayerToKick: PlayerToken | NullToken = TokenManager.get().getFromString(playerToKick);
  const resolvedSupposedHost: PlayerToken | NullToken = TokenManager.get().getFromString(supposedHost);
  const resolvedGameToken: GameToken | NullToken = TokenManager.get().getFromString(gameToken);

  if (resolvedPlayerToKick.isNullToken() || resolvedGameToken.isNullToken() || resolvedSupposedHost.isNullToken()) {
    getLogger().debug("[apiKickPlayer] One of the provided tokens was Null");
    return "failed";
  }

  const resolvedGame = GameManager.get().getByToken(resolvedGameToken);
  if (resolvedGame === undefined) {
    return "failed";
  }

  if (resolvedGame.getHost() != supposedHost) {
    return "unauthorized";
  }

  const response: boolean | undefined = Director.get().kickPlayerFromGame(<PlayerToken> resolvedPlayerToKick, resolvedGameToken);
  if (response === undefined) {
    return "failed";
  } else {
    return "success";
  }
}
