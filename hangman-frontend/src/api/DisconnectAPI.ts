import { BaseApi } from "./BaseApi";
import { Config } from "../Config";

export class DisconnectAPI {

  private static sending: boolean;

  public static async send(gameToken: string, playerToken: string, uuid: string): Promise<{  status: string }> {
    if (this.sending) {
      console.warn("DisconnectAPI: Asked for new request but previous request is still sending!");
      return;
    }
    this.sending = true;

    return await new BaseApi().put<{status: string}>("{0}:{1}/api/game/{2}/{3}/disconnect"
      .replace("{0}", Config.serverURL).replace("{1}", Config.port)
      .replace("{2}", gameToken).replace("{3}", playerToken), {"uuid": uuid})
      .then(({status}) => {
        this.sending = false;
        return {status: status};
      });
  }
}
