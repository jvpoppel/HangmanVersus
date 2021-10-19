import {GameData} from "../model/GameData";
import {TSMap} from "typescript-map";
import {WebElements} from "./WebElements";
import {playerListRow} from "./snippet/PlayerListRow";
import {LocalStorage} from "../data/LocalStorage";
import {DisplayManager} from "./DisplayManager";
import {KickPlayerFromGameAPI} from "../api/KickPlayerFromGameAPI";
import {SubState} from "../model/SubState";
import {FormattedOwnWord} from "../questions/FormattedOwnWord";

export class UpdateWithGameData {
  public static perform(data: GameData): void {

    const playerIsHost: boolean = (data.host === LocalStorage.playerToken());

    const playerTokensAsList = Array.from(data.playerTokens);
    const playerNamesAsList = Array.from(data.playerNames);

    // First; update player list.
    let htmlToAdd = "";

    const playersAndTokens = new TSMap<string, string>();
    let playerIndex = 0;
    while (playerIndex < playerNamesAsList.length) {
      playersAndTokens.set(playerTokensAsList[playerIndex], playerNamesAsList[playerIndex]);

      if (playerIsHost && !data.started) { // If host: Only add when game has not been started.
        htmlToAdd += playerListRow(playerNamesAsList[playerIndex], playerTokensAsList[playerIndex], (!data.started));
      } else {
        htmlToAdd += playerListRow(playerNamesAsList[playerIndex], playerTokensAsList[playerIndex],
          false);
      }

      playerIndex++;
    }
    if (playerIsHost && !data.started) { // Only if game has not been started, host needs a different table.
      WebElements.PLAYER_LIST_BODY_HOST().innerHTML = htmlToAdd;
    } else {
      WebElements.PLAYER_LIST_BODY_PLAYER().innerHTML = htmlToAdd;
    }

    // Before loading anything else; check if game finished!
    if (data.finished) {
      WebElements.WINNER_ROW().style.display = "";
      WebElements.WINNER_VALUE().innerHTML = data.winningRole;
    } else {
      WebElements.WINNER_ROW().style.display = "none";
    }

    // Add listeners to created kick-buttons if player is host and game has not been started yet.
    if (playerIsHost && !data.started) {
      playerIndex = 0;
      while (playerIndex < playerTokensAsList.length) {
        if (playerTokensAsList[playerIndex] === data.host) {
          WebElements.KICK_PLAYER(playerTokensAsList[playerIndex]).remove();
        } else {
          WebElements.KICK_PLAYER(playerTokensAsList[playerIndex]).addEventListener("click", kick, false);
        }
        playerIndex++;
      }
      WebElements.HOST_OPTIONS().style.display = "";
    } else {
      WebElements.HOST_OPTIONS().style.display = "none";
    }

    // If game started; Narrator? column is not needed anymore.
    DisplayManager.ShowCorrectPlayerList(playerIsHost && !data.started);

    /*
    Next, we update the display values of the Start and Disconnect buttons
     */
    if (data.started == false) {
      // If game not started; check if can be started and show start button accordingly
      if (playerIsHost && playerTokensAsList.length === 2) {
        DisplayManager.SHOW_START();
      } else {
        DisplayManager.HIDE_START();
      }
    } else {
      DisplayManager.HIDE_START_STOP();

      /* Also, if game has started, update the game substate */
      DisplayManager.UpdateGameSubState(data.substate);

      /* if game has started & substate is not 'Choosing Words', update word section */
      if (data.substate !== SubState.PLAYERS_CHOOSING_WORDS) {
        const playerGuesses = Array.from(data.ownGuesses);
        const opponentGuesses = Array.from(data.opponentGuesses);
        DisplayManager.SHOW_WORD_SECTION();
        DisplayManager.HIDE_WORD_INPUT();
        WebElements.OWN_CHOSEN_WORD().innerHTML = FormattedOwnWord.givenOwnWord(data.ownWord).andGuesses(data.opponentGuesses);
        WebElements.GUESSES_OWN_WORD().innerText = opponentGuesses.toString();
        WebElements.OWN_INCORRECT_GUESSES().innerText = "" + data.ownIncorrectGuesses;
        WebElements.GUESSES_OPPONENT_WORD().innerText = playerGuesses.toString();
        WebElements.OPPONENT_INCORRECT_GUESSES().innerText = "" + data.opponentIncorrectGuesses;

        let formattedOpponentWord = "";
        data.opponentWord.forEach(letter => {
          if (formattedOpponentWord.length > 0) {
            formattedOpponentWord += " ";
          }
          formattedOpponentWord += letter;
        });
        WebElements.OPPONENT_WORD().innerText = formattedOpponentWord;

        // If the host is the current player && Substate is correct
        if (data.host === LocalStorage.playerToken()) {
          if (data.substate == SubState.PLAYER_ONE_CHOOSING) {
            DisplayManager.SHOW_GUESS_INPUT();
          } else {
            DisplayManager.HIDE_GUESS_INPUT();
          }
        } else {
          if (data.substate == SubState.PLAYER_TWO_CHOOSING) {
            DisplayManager.SHOW_GUESS_INPUT();
          } else {
            DisplayManager.HIDE_GUESS_INPUT();
          }
        }
      } else {
        // We are in word selection!
        DisplayManager.SHOW_WORD_INPUT();
      }
    }
  }
}

export async function kick(event) {
  const playerToKick = event.target.id.split("-")[0];
  await KickPlayerFromGameAPI.send(playerToKick, LocalStorage.gameToken(), LocalStorage.playerToken(), LocalStorage.uuid()).then(response => {
    if (response.status !== "success") {
      console.log("KickPlayerFromGame failed:" + response);
    }
  });
}
