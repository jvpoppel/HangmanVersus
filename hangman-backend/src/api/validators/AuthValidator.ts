import {TokenManager} from "../../manager/TokenManager";
import {NullToken} from "../../model/NullToken";
import {AuthErrorResponse, AuthSuccessResponse} from "../responses/AuthResponse";
import {PlayerToken} from "../../model/PlayerToken";
import {GameToken} from "../../model/GameToken";
import {Director} from "../../manager/Director";
import {getLogger} from "../../endpoint";

export class AuthValidator {
  // Checks if player provided correct UUID && is in given game
  public static ValidatePlayer(playerToken: string, uuid: string, gameToken: string): AuthErrorResponse | AuthSuccessResponse {

    const supposedPlayer: PlayerToken | NullToken = TokenManager.get().getFromString(playerToken);

    if (supposedPlayer.isNullToken()) {
      getLogger().debug("[AuthValidator] supposedPlayer is null " + supposedPlayer.getToken());
      return AuthErrorResponse.UNKNOWN_TOKEN;
    }
    if ((<PlayerToken> supposedPlayer).getUUID() !== uuid) {
      getLogger().debug("[AuthValidator] UUID did not match for player " + supposedPlayer.getToken());
      return AuthErrorResponse.WRONG_UUID;
    }
    if (!Director.get().checkIfPlayerInGame((<PlayerToken> supposedPlayer), TokenManager.get().getFromString(gameToken))) {
      getLogger().debug("[AuthValidator] Player " + supposedPlayer.getToken() + " not in game " + gameToken);
      return AuthErrorResponse.NOT_IN_GAME;
    }
    return new AuthSuccessResponse();
  }

  public static ValidateGame(gameToken: string): AuthErrorResponse | AuthSuccessResponse {
    const supposedGame: GameToken | NullToken = TokenManager.get().getFromString(gameToken);
    if (supposedGame.isNullToken()) {
      return AuthErrorResponse.UNKNOWN_TOKEN;
    }
    return new AuthSuccessResponse();
  }
}
