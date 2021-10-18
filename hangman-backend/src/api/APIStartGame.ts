import {GameManager} from "../manager/GameManager";
import {GameToken} from "../model/GameToken";
import {TokenManager} from "../manager/TokenManager";
import {Token} from "../model/Token";
import {Game} from "../data/Game";
import {getLogger} from "../endpoint";
import {PlayerToken} from "../model/PlayerToken";
import {Director} from "../manager/Director";

export function apiStartGame(supposedHost: string, givenToken: string): string {

  const gameToken: Token = TokenManager.get().getFromString(givenToken);
  const playerToken: Token = TokenManager.get().getFromString(supposedHost);

  if (!(gameToken instanceof GameToken)) {
    getLogger().debug("[APIStartGame] Given token " + givenToken + " is not a game token.");
    return "failed"; // No game on given token
  }
  if (!(playerToken instanceof PlayerToken)) {
    getLogger().debug("[APIStartGame] Given token " + supposedHost + " is not a player token.");
    return "failed"; // No game on given token
  }

  const game: Game | undefined = GameManager.get().getByToken(gameToken);
  if (game === undefined) {
    getLogger().debug("[APIStartGame] Given game " + gameToken + " cannot be found in GameManager.");
    return "failed";
  }

  if (!(supposedHost === game.getHost())) {
    getLogger().debug("[APIStartGame] Given player " + supposedHost + " is not the game host.");
    return "unauthorized";
  }

  const playersInGame: Set<PlayerToken> | undefined = Director.get().getPlayersInGame(gameToken);
  if (playersInGame === undefined) {
    getLogger().debug("[APIStartGame] Game " + gameToken + " could not be found in the Director");
    return "failed";
  }

  if (playersInGame.size != 2) {
    getLogger().debug("[APIStartGame] Game " + givenToken + " could not be started, not exactly 2 players.");
    return "failed"; // Game not started, it needs exactly two players.
  }

  const gameStarted: boolean | undefined = Director.get().startGame(gameToken);
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
