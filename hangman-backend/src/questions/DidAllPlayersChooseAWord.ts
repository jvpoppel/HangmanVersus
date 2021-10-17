import {PlayerToken} from "../model/PlayerToken";
import {GameToken} from "../model/GameToken";
import {Director} from "../manager/Director";
import {NullToken} from "../model/NullToken";
import {PlayerManager} from "../manager/PlayerManager";

export class DidAllPlayersChooseAWord {

  private player: PlayerToken;
  private game: GameToken;

  constructor(player: PlayerToken) {
    this.player = player;
    this.game = new NullToken();
  }

  public static askedBy(player: PlayerToken): DidAllPlayersChooseAWord {
    return new DidAllPlayersChooseAWord(player);
  }

  public inGame(game: GameToken): boolean {
    this.game = game;
    const playersInGame: Set<PlayerToken> | undefined = Director.get().getPlayersInGame(this.game);
    if (playersInGame === undefined) {
      return false; // Game does not exist
    }

    let allPlayersHaveAWord = true;
    // There are only two players in a game, thus just iterate through the set
    playersInGame.forEach(token => {
      if (PlayerManager.get().getByToken(token).getWord() === "") {
        allPlayersHaveAWord = false;
      }
    });
    return allPlayersHaveAWord;
  }

}
