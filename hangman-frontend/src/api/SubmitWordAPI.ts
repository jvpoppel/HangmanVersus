import {GameData} from "../model/GameData";
import {BaseApi} from "./BaseApi";
import {Config} from "../Config";

export class SubmitWordAPI {

  private static sending: boolean;

  public static async send(gameToken: string, playerToken: string, playerUUID: string, chosenWord: string): Promise<GameData> {
    if (this.sending) {
      console.warn("SubmitWordAPI: Asked for new request but previous request is still sending!");
      return;
    }
    this.sending = true;

    return await new BaseApi().post<{ status }>("{0}:{1}/api/game/{2}/{3}/word"
      .replace("{0}", Config.serverURL).replace("{1}", Config.port)
      .replace("{2}", gameToken).replace("{3}", playerToken), {"word": chosenWord, "uuid": playerUUID})
      .then(response => {
        this.sending = false;
        return response;
      });
  }
}
