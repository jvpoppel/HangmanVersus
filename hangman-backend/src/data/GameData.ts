import {Game} from "./Game";
import {GameToken} from "../model/GameToken";
import {PlayerToken} from "../model/PlayerToken";
import {GameManager} from "../manager/GameManager";
import {PlayerManager} from "../manager/PlayerManager";
import {Player} from "./Player";
import {Director} from "../manager/Director";
import {GameRole} from "../model/GameRole";
import {SubState} from "../model/SubState";

// TODO: Change after building the new game type
export class GameData {

  /**
   * Method that converts a given game into a object representation.
   * Basically gives the frontend all data it needs for a certain player.
   * i.e. when a player has role Wolf, only they have to receive wolf-specific data. A player with role
   * Ziener does not need this, and should not be able to receive any data about the Wolf event
   *
   * Both Game and PlayerTokens should be valid.
   *
   * @param gameToken Game to be converted
   * @param playerToken Player calling the conversion
   * @returns "failed" iff game and/or playertokens are not valid. Else, stringified version of game data.
   */
  public static convert(gameToken: GameToken, playerToken: PlayerToken): any {
    const game: Game = GameManager.get().getByToken(gameToken);
    const player: Player = PlayerManager.get().getByToken(playerToken);
    const playersInGame: Set<PlayerToken> | undefined = Director.get().getPlayersInGame(gameToken);

    if (Director.get().checkIfPlayerInGame(playerToken, gameToken) === undefined) {
      return "failed";
    }
    if (playersInGame === undefined) {
      return "failed";
    }

    const playersInGameLST = Array.from(playersInGame);
    const playerNamesInGame: string[] = playersInGameLST.map(playerToken => PlayerManager.get().getByToken(playerToken).getName());
    const playerTokensInGame: string[] = playersInGameLST.map(playerToken => playerToken.getToken());
    const playerRolesInGame: string[] = playersInGameLST.map(queryToken =>
      Director.get().getRoleOfPlayerAsPlayer(PlayerManager.get().getByToken(queryToken), player));
    const playerAliveInGame: string[] = playersInGameLST.map(playerToken => PlayerManager.get().getByToken(playerToken).isAlive() + "");
    const iteration = game.getIteration();

    const generalGameData: any = {
      "status": "success",
      "gameState": game.getState(),
      "gameToken": game.getToken().getToken(),
      "playerToken": player.getToken().getToken(),
      "host": game.getHost(),
      "iteration": iteration,
      "started": !game.playerCanJoin(),
      "finished": game.isFinished(),
      "winningRole": game.getWinningRole(),
      "playerTokens": playerTokensInGame,
      "playerNames": playerNamesInGame,
      "playerRoles": playerRolesInGame,
      "playersAliveInGame": playerAliveInGame,
      "role": player.getRole(),
      "roleDescription": player.getRole() + " role description",
      "alive": player.isAlive(),
      "substate": game.getSubState()
    };
    return GameData.addPlayerSpecificData(game, player, generalGameData);

    // Now; put the player-specific data in there.
  }

  public static addPlayerSpecificData(game: Game, player: Player, currentData: any): any {

    // For now, not yet needed.
    // To be used for i.e. Player 1 to receive their own word, and the current state of Player 2.

    return currentData;
  }
}
