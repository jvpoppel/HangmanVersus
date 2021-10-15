import {GameData} from "../model/GameData";
import {BaseApi} from "./BaseApi";
import {Config} from "../Config";

export class KickPlayerFromGameAPI {

  private static sending: boolean;

  public static async send(playerToken: string, gameToken: string, supposedHost: string, hostUuid: string): Promise<GameData> {
    if (this.sending) {
      console.warn("KickPlayerFromGameAPI: Asked for new request but previous request is still sending!");
      return;
    }
    this.sending = true;

    return await new BaseApi().post<{ status }>("{0}:{1}/api/game/{2}/{3}/kick"
      .replace("{0}", Config.serverURL).replace("{1}", Config.port)
      .replace("{2}", gameToken).replace("{3}", playerToken), {"host": supposedHost, "uuid": hostUuid})
      .then(response => {
        this.sending = false;
        return response;
      });
  }
}
