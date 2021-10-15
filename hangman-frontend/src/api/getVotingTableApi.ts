import {BaseApi} from "./BaseApi";
import {Config} from "../Config";

export class GetVotingTableApi {

  private static sending: boolean;

  public static async send(gameToken: string, playerToken: string, uuid: string): Promise<any> {
    if (this.sending) {
      console.warn("GetVotingTableApi: Asked for new request but previous request is still sending!");
      return;
    }
    this.sending = true;

    return await new BaseApi().post<any>("{0}:{1}/api/game/{2}/{3}/vote"
      .replace("{0}", Config.serverURL).replace("{1}", Config.port)
      .replace("{2}", gameToken).replace("{3}", playerToken), {"uuid":uuid})
      .then(response => {
        this.sending = false;
        return response;
      });
  }
}
