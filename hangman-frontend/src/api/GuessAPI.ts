import {GameData} from "../model/GameData";
import {BaseApi} from "./BaseApi";
import {Config} from "../Config";

export class GuessAPI {

  private static sending: boolean;

  public static async send(gameToken: string, playerToken: string, playerUUID: string, guess: string): Promise<GameData> {
    if (this.sending) {
      console.warn("GuessAPI: Asked for new request but previous request is still sending!");
      return;
    }
    this.sending = true;

    return await new BaseApi().post<{ status }>("{0}:{1}/api/game/{2}/{3}/guess"
      .replace("{0}", Config.serverURL).replace("{1}", Config.port)
      .replace("{2}", gameToken).replace("{3}", playerToken), {"guess": guess, "uuid": playerUUID})
      .then(response => {
        this.sending = false;
        return response;
      });
  }
}
