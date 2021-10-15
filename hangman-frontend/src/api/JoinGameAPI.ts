import {LocalStorage} from "../data/LocalStorage";
import {DisplayManager} from "../elem/DisplayManager";
import {BaseApi} from "./BaseApi";
import {Config} from "../Config";
import {TSMap} from "typescript-map";

export class JoinGameAPI {

  private static sending: boolean;

  public static async send(gameToken: string, playerName: string): Promise<TSMap<string, string>> {
    if (this.sending) {
      console.warn("JoinGameAPI: Asked for new request but previous request is still sending!");
      return;
    }
    this.sending = true;

    return await new BaseApi().post<{player: string, uuid: string}>("{0}:{1}/api/game/join".replace("{0}", Config.serverURL)
      .replace("{1}", Config.port), {"gameToken": gameToken, "playerName": playerName})
      .then(({player, uuid}) => {
        LocalStorage.setPlayerToken(player);
        LocalStorage.setGameToken(gameToken);
        LocalStorage.setUUID(uuid);
        DisplayManager.HomePageToGame();
        DisplayManager.UpdateGameCode(gameToken);
        this.sending = false;
        return new TSMap<string, string>().set("gameToken", gameToken).set("playerToken", player).set("uuid", uuid);
      });
  }
}
