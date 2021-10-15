import {GetVotingTableApi} from "../api/getVotingTableApi";
import {LocalStorage} from "../data/LocalStorage";
import {TSMap} from "typescript-map";
import {generateResultRow} from "./snippet/VotingResultRow";
import {WebElements} from "./WebElements";

export class BuildVotingTable {
  public static async perform(playerTokensAsList: string[], playerNamesAsList: string[], alivePlayersAndTokens: TSMap<string, string>): Promise<void> {
    await GetVotingTableApi.send(LocalStorage.gameToken(), LocalStorage.playerToken(), LocalStorage.uuid()).then(data => {
      if (data["status"] === "success") {
        let tableContent = "";
        alivePlayersAndTokens.keys().forEach(token => {
          const playerIndex = playerTokensAsList.indexOf(token);
          tableContent += generateResultRow(playerNamesAsList[playerIndex], data[token]);
        });
        WebElements.VOTE_RESULTS_CONTENT().innerHTML = tableContent;
        WebElements.VOTE_RESULTS_ROW().style.display = "";
      } else {
        console.log("Status was not success!");
      }

    });
  }
}
