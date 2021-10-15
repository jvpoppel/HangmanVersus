import { BaseApi } from "./BaseApi";
import { Config } from "../Config";

export class MediumApi {

  private static sending: boolean;

  public static async send(gameToken: string, playerToken: string, uuid: string, onPlayer: string): Promise<{  status: string }> {
    if (this.sending) {
      console.warn("MediumApi: Asked for new request but previous request is still sending!");
      return;
    }
    this.sending = true;

    return await new BaseApi().post<{status: string}>("{0}:{1}/api/game/{2}/{3}/night/medium"
      .replace("{0}", Config.serverURL).replace("{1}", Config.port)
      .replace("{2}", gameToken).replace("{3}", playerToken), {"uuid": uuid, "onPlayer": onPlayer})
      .then(({status}) => {
        this.sending = false;
        return {status};
      });
  }
}
