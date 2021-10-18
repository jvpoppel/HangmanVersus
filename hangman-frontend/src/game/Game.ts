import {CheckGameIterationAPI} from "../api/CheckGameIterationAPI";
import {GetGameDataAPI} from "../api/GetGameDataAPI";
import {GameData} from "../model/GameData";
import {UpdateWithGameData} from "../elem/UpdateWithGameData";
import {DisplayManager} from "../elem/DisplayManager";
import {LocalStorage} from "../data/LocalStorage";

export class Game {

  private gameToken: string;
  private playerToken: string;
  private uuid: string;
  private iteration: number; // Known game iteration
  private run: boolean; // Iff true: Loop continues

  constructor(gameToken: string, playerToken: string) {
    this.gameToken = gameToken;
    this.playerToken = playerToken;
    this.uuid = LocalStorage.uuid();
    this.iteration = -1;
    this.run = false;
  }

  public start(): Game {
    this.run = true;
    this.loop();
    return this;
  }

  public terminate(): Game {
    this.run = false;
    return this;
  }

  private sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async loop() {
    while (this.run) {
      await this.sleep(1000);
      const serverIteration = await new Promise<number>(resolve => resolve(CheckGameIterationAPI.send(this.gameToken, this.playerToken).then(result => {
        return result;
      })));

      /* Player not in game anymore (kicked?), stop loop, go back to homepage. */
      if (serverIteration == -1) {
        LocalStorage.clear();
        DisplayManager.GameToHomePage();
        this.run = false;
      } else if (serverIteration != this.iteration) {
        console.debug(Date.now() + ": Client out of sync with server. Fetching server data...");
        const newGameData: GameData = await new Promise<GameData>(resolve => resolve(
          GetGameDataAPI.send(this.playerToken, this.gameToken, this.iteration, this.uuid)
            .then(response => {
              return response;
            })));
        this.iteration = newGameData.iteration;
        UpdateWithGameData.perform(newGameData);
        if (newGameData.gameState === "RESOLVED_WAITFORTOKENRELEASE") {
          // Game finished.
          this.run = false;
          LocalStorage.clear();
          DisplayManager.GameToHomePage();
        }
      }
    }
  }
}
