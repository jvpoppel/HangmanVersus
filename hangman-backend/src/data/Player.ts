import {TokenBuilder} from "./TokenBuilder";
import {PlayerToken} from "../model/PlayerToken";
import {GameRole} from "../model/GameRole";
import {NullToken} from "../model/NullToken";

export class Player {

  private token: PlayerToken | NullToken;
  private name: string;
  private role: GameRole;
  private word: string;
  private readonly guesses: string[];
  private incorrectGuesses: number;

  constructor() {
    this.token = TokenBuilder.nullToken();
    this.name = "Player";
    this.role = GameRole.UNDECIDED;
    this.word = "";
    this.guesses = [];
    this.incorrectGuesses = 0;
  }

  public addGuess(guess: string): Player {
    this.guesses.push(guess);
    return this;
  }

  public getGuesses(): string[] {
    return this.guesses;
  }

  public getIncorrectGuesses(): number {
    return this.incorrectGuesses;
  }

  public getName(): string {
    return this.name;
  }

  public getRole(): GameRole {
    return this.role;
  }

  public getToken(): PlayerToken {
    if (this.token instanceof NullToken) {
      throw new Error("Player has no token assigned");
    }
    return this.token;
  }

  public getWord(): string {
    return this.word;
  }

  /**
   * Increase the number of incorrect guesses for this player
   */
  public increaseIncorrectGuesses(): number {
    this.incorrectGuesses ++;
    return this.incorrectGuesses;
  }

  public setName(name: string): Player {
    this.name = name;
    return this;
  }

  public setRole(role: GameRole): Player {
    this.role = role;
    return this;
  }

  public setToken(token: PlayerToken): Player {
    this.token = token;
    return this;
  }

  public setWord(word: string): Player {
    this.word = word;
    return this;
  }
}
