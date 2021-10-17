import {GameToken} from "../model/GameToken";
import {TokenManager} from "../manager/TokenManager";
import {Token} from "../model/Token";
import {getLogger} from "../endpoint";
import {PlayerToken} from "../model/PlayerToken";
import {Director} from "../manager/Director";

export function apiChooseWord(givenPlayerToken: string, givenGameToken: string, chosenWord: string): string {

  const gameToken: Token = TokenManager.get().getFromString(givenGameToken);
  const playerToken: Token = TokenManager.get().getFromString(givenPlayerToken);

  if (!(gameToken instanceof GameToken)) {
    getLogger().debug("[APIChooseWord] Given token " + givenGameToken + " is not a game token.");
    return "failed"; // No game on given token
  }
  if (!(playerToken instanceof PlayerToken)) {
    getLogger().debug("[APIChooseWord] Given token " + givenPlayerToken + " is not a player token.");
    return "failed"; // No game on given token
  }

  if (Director.get().checkIfPlayerInGame(playerToken, gameToken) === undefined) {
    getLogger().debug("[APIChooseWord] Given player " + givenPlayerToken + " is not in the game.");
    return "unauthorized";
  }

  const wordChosen: boolean | undefined = Director.get().setWordForPlayer(playerToken, gameToken, chosenWord);
  if (wordChosen === undefined) {
    getLogger().debug("[APIChooseWord] Word " + chosenWord + " could not be set for player " + playerToken + ".");
    return "failed"; // Game not started, might be already in progress
  } else if (!wordChosen) {
    getLogger().debug("[APIChooseWord] Word " + chosenWord + " could not be set for player " + playerToken + ", player already has a word set.");
    return "failed"; // Game not started, might be already in progress
  }
  getLogger().info("[APIChooseWord] Word " + chosenWord + " has been set for player " + playerToken + ".");
  return "success";
}
