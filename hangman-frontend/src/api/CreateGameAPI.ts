import { LocalStorage } from "../data/LocalStorage";
import { DisplayManager } from "../elem/DisplayManager";
import { BaseApi } from "./BaseApi";
import { Config } from "../Config";
import {TSMap} from "typescript-map";

export class CreateGameAPI {

  private static sending: boolean;

  public static async send(playerName: string): Promise<TSMap<string, string>> {
    if (this.sending) {
      console.warn("CreateGameAPI: Asked for new request but previous request is still sending!");
      return;
    }
    this.sending = true;

    return await new BaseApi().post<{playerToken: string; gameToken: string, uuid: string}>("{0}:{1}/api/game/create"
      .replace("{0}", Config.serverURL).replace("{1}", Config.port), {"playerName": playerName})
      .then(({playerToken, gameToken, uuid}) => {
        LocalStorage.setPlayerToken(playerToken);
        LocalStorage.setGameToken(gameToken);
        LocalStorage.setUUID(uuid);
        DisplayManager.HomePageToGame();
        DisplayManager.UpdateGameCode(gameToken);
        this.sending = false;
        return new TSMap<string, string>().set("gameToken", gameToken).set("playerToken", playerToken).set("uuid", uuid);
      });
  }
}
