import {GameData} from "../model/GameData";
import {TSMap} from "typescript-map";
import {WebElements} from "./WebElements";
import {playerListRow} from "./snippet/PlayerListRow";
import {LocalStorage} from "../data/LocalStorage";
import {DisplayManager} from "./DisplayManager";
import {KickPlayerFromGameAPI} from "../api/KickPlayerFromGameAPI";
import {SubState} from "../model/SubState";
import {ProcessVote} from "./ProcessVote";
import {votingOption} from "./snippet/VotingOption";

export class UpdateWithGameData {
  public static perform(data: GameData): void {

    const playerIsHost: boolean = (data.host === LocalStorage.playerToken());

    const playerTokensAsList = Array.from(data.playerTokens);
    const playerNamesAsList = Array.from(data.playerNames);
    const playerRolesAsList = Array.from(data.playerRoles);
    const playersAliveAsList = Array.from(data.playersAliveInGame);

    // First; update player list.
    let htmlToAdd = "";

    const playersAndTokens = new TSMap<string, string>();
    let playerIndex = 0;
    while (playerIndex < playerNamesAsList.length) {
      playersAndTokens.set(playerTokensAsList[playerIndex], playerNamesAsList[playerIndex]);

      if (playerIsHost && !data.started) { // If host: Only add when game has not been started.
        htmlToAdd += playerListRow(playerNamesAsList[playerIndex], playerTokensAsList[playerIndex], (!data.started), "", true);
      } else {
        htmlToAdd += playerListRow(playerNamesAsList[playerIndex], playerTokensAsList[playerIndex],
          false, playerRolesAsList[playerIndex], playersAliveAsList[playerIndex] === "true");
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

    }
    // If game started; Narrator? column is not needed anymore.
    DisplayManager.ShowCorrectPlayerList(playerIsHost && !data.started);

    /*
    Next, we update the display values of the Start and Disconnect buttons
     */
    if (data.started == false) {
      if (playerIsHost) {
        DisplayManager.SHOW_START();
      }
    } else {
      DisplayManager.HIDE_START_STOP();

      /* Also, if game has started, update the game substate */
      DisplayManager.UpdateGameSubState(data.substate);
    }

    /*
    After that, we update the role information
     */
    WebElements.ROLE_NAME().innerHTML = data.role;
    WebElements.ROLE_INFO().innerHTML = data.roleDescription;

    /*
     Then, if game is in PostVote state OR first day, show Start Night for narrator
     */
    if ((data.substate === SubState.DAYTIME_POSTVOTE.valueOf() || data.substate === SubState.DAYTIME_FIRST.valueOf())
      && data.role === "Narrator") {

      WebElements.START_NIGHT_ROW().style.display = "";
    } else {
      WebElements.START_NIGHT_ROW().style.display = "none";
    }

    // When night begins, always reset voting results table
    if (data.substate === SubState.NIGHTTIME_SELECTION.valueOf()) {
      WebElements.VOTE_RESULTS_ROW().style.display = "none";
      WebElements.VOTE_RESULTS_CONTENT().innerHTML = "";
    }

    /*
    After that, check if game is in Night and update the game for the narrator accordingly
     */
    if (data.substate === SubState.NIGHTTIME_SELECTION.valueOf() && data.role === "Narrator") {
      DisplayManager.ShowNightControls();
      const rolesStillForNight = Array.from(data.rolesStillInNight);
      const playersKilledInNight = Array.from(data.playersKilledInNight);
      if (playersKilledInNight.length == 0) {
        WebElements.PLAYERS_KILLED_ROW().style.display = "none";
        WebElements.PLAYERS_KILLED_TEXT().innerText = "";
      } else {
        let playersKilled = "";
        playersKilledInNight.forEach(player => {
          if (playersKilled !== "") {
            playersKilled += ", ";
          }
          playersKilled += player;
        });

        WebElements.PLAYERS_KILLED_TEXT().innerText = playersKilled;
        WebElements.PLAYERS_KILLED_ROW().style.display = "";
      }
      if (rolesStillForNight.length == 0) {
        WebElements.FINISH_NIGHT().style.display = "";
      } else {
        WebElements.FINISH_NIGHT().style.display = "none";
      }

      // Make list of which buttons to hide and remove the ones that have to stay.
      const showButtons: string[] = ["Wolf", "Medium"];
      rolesStillForNight.forEach(function(role) {
        if (role === "Wolf") {
          showButtons.splice(showButtons.indexOf("Wolf"), 1);
        } else if (role === "Medium") {
          showButtons.splice(showButtons.indexOf("Medium"), 1);
        }
      });
      showButtons.forEach(button => {
        if (button === "Wolf") {
          WebElements.WOLVES_NIGHT().style.display = "none";
        } else if (button === "Medium") {
          WebElements.MEDIUM_NIGHT().style.display = "none";
        }
      });
    } else {
      DisplayManager.HideNightControls();
      DisplayManager.ResetNightControls();
    }

    // Medium Night
    if (data.role === "Medium") {
      // If SubState == Night Medium, show select.
      if (data.substate === SubState.NIGHTTIME_MEDIUM.valueOf()) {
        let options = "";
        let index = 0;
        while ( index < playersAliveAsList.length) {
          if (playersAliveAsList[index] === "true" && playerRolesAsList[index] != "Medium" || playerRolesAsList[index] != "Narrator") {
            options += votingOption(playerTokensAsList[index], playerNamesAsList[index]);
          }
          index++;
        }
        WebElements.MEDIUM_SELECTION().innerHTML = options;
        WebElements.MEDIUM_ROW().style.display = "";
        WebElements.MEDIUM_PRE_SELECT().style.display = "";
        WebElements.MEDIUM_POST_SELECT().style.display = "none";
      }

      if (data.substate === SubState.NIGHTTIME_SELECTION.valueOf() || data.substate === SubState.NIGHTTIME_WOLVES.valueOf()) {
        // Only update if filled
        if (data.playerRoleChecked != undefined) {
          WebElements.MEDIUM_PRE_SELECT().style.display = "none";
          WebElements.MEDIUM_POST_SELECT().style.display = "";
          WebElements.MEDIUM_ROW().style.display = "";

          WebElements.MEDIUM_ROLE().innerHTML = data.playerRoleChecked;
          WebElements.MEDIUM_NAME().innerHTML = data.playerNameChecked;
        }
      }
    } else {
      WebElements.MEDIUM_SELECTION().innerHTML = "";
      WebElements.MEDIUM_PRE_SELECT().style.display = "none";
      WebElements.MEDIUM_POST_SELECT().style.display = "none";
      WebElements.MEDIUM_ROW().style.display = "none";
    }

    /*
      Voting
     */
    ProcessVote.perform(data, playerTokensAsList, playerNamesAsList, playerRolesAsList, playersAliveAsList);
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
