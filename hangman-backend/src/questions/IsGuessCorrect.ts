import {PlayerToken} from "../model/PlayerToken";
import {GameToken} from "../model/GameToken";
import {Director} from "../manager/Director";
import {NullToken} from "../model/NullToken";
import {PlayerManager} from "../manager/PlayerManager";

export class IsGuessCorrect {

  private player: PlayerToken;
  private game: GameToken;

  constructor(player: PlayerToken) {
    this.player = player;
    this.game = new NullToken();
  }

  public static askedBy(player: PlayerToken): IsGuessCorrect {
    return new IsGuessCorrect(player);
  }

  public inGame(game: GameToken): IsGuessCorrect {
    this.game = game;
    return this;
  }

  public guessing(guess: string): boolean {
    const playersInGame: Set<PlayerToken> | undefined = Director.get().getPlayersInGame(this.game);
    if (playersInGame === undefined) {
      return false; // Game does not exist
    }

    let guessCorrect = false;
    // There are only two players in a game, thus just iterate through the set
    playersInGame.forEach(token => {
      if (token.getToken() !== this.player.getToken()) { // Only do something with the different player
        guessCorrect = (PlayerManager.get().getByToken(token).getWord().toLowerCase()).indexOf(guess) >= 0;
      }
    });
    return guessCorrect;
  }

}
