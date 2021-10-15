import {BaseApi} from "./BaseApi";
import {Config} from "../Config";

export class VoteOnPlayerApi {

  private static sending: boolean;

  public static async send(gameToken: string, playerToken: string, uuid: string, onPlayerToken: string): Promise<{ status: string }> {
    if (this.sending) {
      console.warn("VoteOnPlayerApi: Asked for new request but previous request is still sending!");
      return;
    }
    this.sending = true;

    return await new BaseApi().post<{ status: string }>("{0}:{1}/api/game/{2}/{3}/vote"
      .replace("{0}", Config.serverURL).replace("{1}", Config.port)
      .replace("{2}", gameToken).replace("{3}", playerToken), { "uuid":uuid, "onPlayer":onPlayerToken })
      .then(response => {
        this.sending = false;
        return response;
      });
  }
}
