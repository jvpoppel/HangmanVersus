import {GameToken} from "../model/GameToken";
import {TokenManager} from "../manager/TokenManager";
import {Token} from "../model/Token";
import {getLogger} from "../endpoint";
import {PlayerToken} from "../model/PlayerToken";
import {Director} from "../manager/Director";

export function apiGuess(givenPlayerToken: string, givenGameToken: string, guess: string): string {

  const gameToken: Token = TokenManager.get().getFromString(givenGameToken);
  const playerToken: Token = TokenManager.get().getFromString(givenPlayerToken);

  if (!(gameToken instanceof GameToken)) {
    getLogger().debug("[APIGuess] Given token " + givenGameToken + " is not a game token.");
    return "failed"; // No game on given token
  }
  if (!(playerToken instanceof PlayerToken)) {
    getLogger().debug("[APIGuess] Given token " + givenPlayerToken + " is not a player token.");
    return "failed"; // No game on given token
  }

  if (Director.get().checkIfPlayerInGame(playerToken, gameToken) === undefined) {
    getLogger().debug("[APIGuess] Given player " + givenPlayerToken + " is not in the game.");
    return "unauthorized";
  }

  const wordChosen: boolean | undefined = Director.get().addGuessForPlayer(playerToken, gameToken, guess);
  if (wordChosen === undefined) {
    getLogger().debug("[APIGuess] Guess for " + playerToken + " could not be processed.");
    return "failed"; // Game not started, might be already in progress
  } else if (!wordChosen) {
    getLogger().debug("[APIGuess] Guess for " + playerToken + " could not be processed.");
    return "failed"; // Game not started, might be already in progress
  }
  getLogger().info("[APIGuess] Guess processed for " + playerToken + ".");
  return "success";
}
