import {GameData} from "../model/GameData";
import {SubState} from "../model/SubState";
import {WebElements} from "./WebElements";
import {TSMap} from "typescript-map";
import {votingOption} from "./snippet/VotingOption";
import {BuildVotingTable} from "./BuildVotingTable";

export class ProcessVote {

  public static perform(data: GameData, playerTokensAsList: string[], playerNamesAsList: string[],
    playerRolesAsList: string[], playersAliveAsList: string[]): void {

    if (data.substate === SubState.DAYTIME_FIRST.valueOf() ||
      data.substate === SubState.NIGHTTIME_SELECTION.valueOf() ||
      data.substate === SubState.NIGHTTIME_MEDIUM.valueOf() ||
      data.substate === SubState.NIGHTTIME_WOLVES.valueOf()) {
      // Make sure everything is disabled outside of votes
      WebElements.VOTE_RESULTS_ROW().style.display = "none";
      WebElements.VOTE_RESULTS_CONTENT().innerHTML = "";
      WebElements.PLAYER_VOTE_ROW().style.display = "none";
      WebElements.NARRATOR_VOTE_ROW().style.display = "none";
      return;
    }

    // Define map consisting of key, value pairs of ALIVE player tokens & names.
    const alivePlayersAndTokens: TSMap<string, string> = new TSMap<string, string>();
    let playerIndex = 0;
    while (playerIndex < playerTokensAsList.length) {
      if (playersAliveAsList[playerIndex] == true+"") {
        if (playerRolesAsList[playerIndex] !== "Narrator") {
          alivePlayersAndTokens.set(playerTokensAsList[playerIndex], playerNamesAsList[playerIndex]);
        }
      }
      playerIndex++;
    }

    if (!data.alive) {
      // Player not alive, do nothing except building the table in some cases.
      if (data.substate === SubState.DAYTIME_TIEDVOTE.valueOf() || data.substate === SubState.DAYTIME_POSTVOTE.valueOf()) {
        console.log("Build voting table!");
        BuildVotingTable.perform(playerTokensAsList, playerNamesAsList, alivePlayersAndTokens);
      }
      return;
    }

    // For all alive players, build the select list and show Lock button
    if (data.role !== "Narrator") {
      // When substate is in voting process, build the option list and enable HTML elements
      if (data.substate === SubState.DAYTIME_VOTING.valueOf()) {
        let options = "";
        alivePlayersAndTokens.keys().forEach(key => {
          options += votingOption(key, alivePlayersAndTokens.get(key));
        });
        WebElements.VOTE_OPTIONS().innerHTML = options;
        WebElements.LOCK_VOTE().style.display = "";
        WebElements.PLAYER_VOTE_ROW().style.display = "";
      }

      // For players, only build result table if TIED or POST
      if (data.substate === SubState.DAYTIME_TIEDVOTE.valueOf() || data.substate === SubState.DAYTIME_POSTVOTE.valueOf()) {
        console.log("Build voting table!");
        BuildVotingTable.perform(playerTokensAsList, playerNamesAsList, alivePlayersAndTokens);
      }
    } else {
      // Check if substate is valid
      if (data.substate === SubState.DAYTIME_VOTING.valueOf() || data.substate === SubState.DAYTIME_POSTVOTE ||
      data.substate === SubState.DAYTIME_TIEDVOTE) {
        // Build page for narrator

        WebElements.NARRATOR_VOTE_ROW().style.display = "";
        WebElements.VOTE_RESULT_NARRATOR().innerHTML = data.voteWinner;

        let playersThatHaveToVote = "";

        // Update list of players that still have to vote.
        data.playersStillNeedingToVote.forEach(player => {
          if (playersThatHaveToVote != "") {
            playersThatHaveToVote += ", ";
          }
          playersThatHaveToVote += player;
        });
        // List might be empty, if still empty string, put 'Everyone voted!' and enable 'Finish Vote' button
        if (playersThatHaveToVote == "") {
          WebElements.FINISH_VOTE().style.display = "";
          playersThatHaveToVote = "Everyone voted!";
        }
        WebElements.PLAYERS_THAT_HAVE_TO_VOTE().innerHTML = playersThatHaveToVote;

        if (data.substate === SubState.DAYTIME_POSTVOTE.valueOf()) {
          // Post vote; disable Finish Vote
          WebElements.FINISH_VOTE().style.display = "none";
        }
        if (data.substate === SubState.DAYTIME_TIEDVOTE.valueOf()) {
          // Narrator: Show 'Reset Vote' button when substate = Tied
          WebElements.RESET_VOTE().style.display = "";
        } else {
          // Hide otherwise
          WebElements.RESET_VOTE().style.display = "none";
        }

        // Narrator: Always build voting table.
        BuildVotingTable.perform(playerTokensAsList, playerNamesAsList, alivePlayersAndTokens);
      } else {
        // Not in voting mode, hide narrator row.
        WebElements.NARRATOR_VOTE_ROW().style.display = "none";
      }

      // When substate is in TIED, hide voting row
      if (data.substate === SubState.DAYTIME_TIEDVOTE.valueOf()) {
        WebElements.PLAYER_VOTE_ROW().style.display = "none";
      }
    }
  }
}
