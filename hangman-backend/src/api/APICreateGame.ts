import {Director} from "../manager/Director";
import {TSMap} from "typescript-map";

export function apiCreateGame(playerName: string): TSMap<string, string> {
  return Director.get().createGameForPlayer(playerName);
}
