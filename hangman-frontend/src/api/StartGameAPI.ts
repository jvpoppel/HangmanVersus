import {GameData} from "../model/GameData";
import {BaseApi} from "./BaseApi";
import {Config} from "../Config";

export class StartGameAPI {

  private static sending: boolean;

  public static async send(gameToken: string, playerToken: string, hostUuid: string, narrator: string): Promise<GameData> {
    if (this.sending) {
      console.warn("StartGameAPI: Asked for new request but previous request is still sending!");
      return;
    }
    this.sending = true;

    return await new BaseApi().put<{ status }>("{0}:{1}/api/game/{2}/start"
      .replace("{0}", Config.serverURL).replace("{1}", Config.port)
      .replace("{2}", gameToken), {"host": playerToken, "uuid": hostUuid, "narrator": narrator})
      .then(response => {
        this.sending = false;
        return response;
      });
  }
}
