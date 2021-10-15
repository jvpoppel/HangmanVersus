import { BaseApi } from "./BaseApi";
import { Config } from "../Config";

export class NightApi {

  private static sending: boolean;

  public static async send(gameToken: string, playerToken: string, uuid: string, action: string): Promise<string> {
    if (this.sending) {
      console.warn("NightApi: Asked for new request but previous request is still sending!");
      return;
    }
    this.sending = true;

    return await new BaseApi().put<{status: string}>("{0}:{1}/api/game/{2}/{3}/night"
      .replace("{0}", Config.serverURL).replace("{1}", Config.port)
      .replace("{2}", gameToken).replace("{3}", playerToken), {"uuid": uuid, "action": action})
      .then(({status}) => {
        this.sending = false;
        return status;
      });
  }
}
