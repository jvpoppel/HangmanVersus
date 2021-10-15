import {GameData} from "../model/GameData";
import {BaseApi} from "./BaseApi";
import {Config} from "../Config";

export class GetGameDataAPI {

  private static sending: boolean;

  public static async send(playerToken: string, gameToken: string, iteration: number, uuid: string): Promise<GameData> {
    if (this.sending) {
      console.warn("GetGameDataAPI: Asked for new request but previous request is still sending!");
      return;
    }
    this.sending = true;

    return await new BaseApi().post<GameData>("{0}:{1}/api/game/{2}/{3}/data"
      .replace("{0}", Config.serverURL).replace("{1}", Config.port)
      .replace("{2}", gameToken).replace("{3}", playerToken), {"iteration": iteration+"", "uuid":uuid})
      .then(response => {
        this.sending = false;
        return response;
      });
  }
}
