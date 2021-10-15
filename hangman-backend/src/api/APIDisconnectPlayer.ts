import {PlayerToken} from "../model/PlayerToken";
import {NullToken} from "../model/NullToken";
import {TokenManager} from "../manager/TokenManager";
import {GameToken} from "../model/GameToken";
import {getLogger} from "../endpoint";
import {Director} from "../manager/Director";

export function apiDisconnectPlayer(playerToken: string, gameToken: string): string {
  const resolvedPlayer: PlayerToken | NullToken = TokenManager.get().getFromString(playerToken);
  const resolvedGame: GameToken | NullToken = TokenManager.get().getFromString(gameToken);

  if (resolvedPlayer.isNullToken() || resolvedGame.isNullToken()) {
    getLogger().debug("[apiDisconnectPlayer] One of the provided tokens was Null");
    return "failed";
  }

  const response: boolean | undefined = Director.get().kickPlayerFromGame(<PlayerToken> resolvedPlayer, resolvedGame);
  if (response === undefined) {
    return "failed";
  } else {
    return "success";
  }
}
