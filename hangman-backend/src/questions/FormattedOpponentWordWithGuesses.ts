import {PlayerToken} from "../model/PlayerToken";
import {GameToken} from "../model/GameToken";
import {Director} from "../manager/Director";
import {NullToken} from "../model/NullToken";
import {PlayerManager} from "../manager/PlayerManager";
import {Player} from "../data/Player";
import {GameManager} from "../manager/GameManager";

export class FormattedOpponentWordWithGuesses {

  private player: PlayerToken;
  private game: GameToken;

  constructor(player: PlayerToken) {
    this.player = player;
    this.game = new NullToken();
  }

  public static askedBy(player: PlayerToken): FormattedOpponentWordWithGuesses {
    return new FormattedOpponentWordWithGuesses(player);
  }

  public inGame(game: GameToken): string[] {
    this.game = game;

    const involvedGame = GameManager.get().getByToken(game);
    if (involvedGame === undefined) {
      return [];
    }

    const playersInGame: Set<PlayerToken> | undefined = Director.get().getPlayersInGame(this.game);
    if (playersInGame === undefined) {
      return []; // Game does not exist
    }

    const playersList: PlayerToken[] = Array.from(playersInGame);
    const ownPlayer: Player = PlayerManager.get().getByToken(this.player);
    let opponentPlayer: Player;

    // There are only two players, thus resolving the opponent can be done easily with an if-statement
    if (ownPlayer.getToken() === playersList[0]) {
      opponentPlayer = PlayerManager.get().getByToken(playersList[1]);
    } else {
      opponentPlayer = PlayerManager.get().getByToken(playersList[0]);
    }

    const guesses: string[] = ownPlayer.getGuesses();
    const word: string[] = [...opponentPlayer.getWord().toLowerCase()];

    if (involvedGame.isFinished()) {
      // Game finished; just return complete word.
      return word;
    }

    let index = 0;

    while (index < word.length) {
      if (guesses.indexOf(word[index].toLowerCase()) < 0) {
        word[index] = "_";
      }
      index ++;
    }

    return word;
  }

}
