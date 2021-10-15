import {GameManager} from "../manager/GameManager";
import {GameToken} from "../model/GameToken";
import {TokenManager} from "../manager/TokenManager";
import {Token} from "../model/Token";
import {Game} from "../data/Game";
import {getLogger} from "../endpoint";
import {PlayerToken} from "../model/PlayerToken";
import {Director} from "../manager/Director";

export function apiStartGame(supposedHost: string, givenToken: string, narratorToken: string): string {

  const gameToken: Token = TokenManager.get().getFromString(givenToken);
  const playerToken: Token = TokenManager.get().getFromString(supposedHost);
  const narrator: Token = TokenManager.get().getFromString(narratorToken);

  if (!(gameToken instanceof GameToken)) {
    getLogger().debug("[APIStartGame] Given token " + givenToken + " is not a game token.");
    return "failed"; // No game on given token
  }
  if (!(playerToken instanceof PlayerToken)) {
    getLogger().debug("[APIStartGame] Given token " + supposedHost + " is not a player token.");
    return "failed"; // No game on given token
  }
  if (!(narrator instanceof PlayerToken)) {
    getLogger().debug("[APIStartGame] Given token " + narratorToken + " is not a player token.");
    return "failed"; // No game on given token
  }
  if (!Director.get().checkIfPlayerInGame(narrator, gameToken)) {
    getLogger().debug("[APIStartGame] Given narrator " + narratorToken + " is not in game " + givenToken);
    return "failed"; // No game on given token
  }

  const game: Game = GameManager.get().getByToken(gameToken);

  if (!(supposedHost === game.getHost())) {
    getLogger().debug("[APIStartGame] Given player " + supposedHost + " is not the game host.");
    return "unauthorized";
  }

  const gameStarted: boolean | undefined = Director.get().startGameWithNarrator(gameToken, narrator);
  if (gameStarted === undefined) {
    getLogger().debug("[APIStartGame] Game " + givenToken + " could not be started.");
    return "failed"; // Game not started, might be already in progress
  } else if (!gameStarted) {
    getLogger().debug("[APIStartGame] Game " + givenToken + " could not be started.");
    return "failed"; // Game not started, might be already in progress
  }
  getLogger().info("[APIStartGame] Game " + givenToken + " has started.");
  return "success";
}
