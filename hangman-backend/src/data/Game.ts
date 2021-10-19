import {GameToken} from "../model/GameToken";
import {TokenBuilder} from "./TokenBuilder";
import {Token} from "../model/Token";
import {Player} from "./Player";
import {SubState} from "../model/SubState";
import {GameRole} from "../model/GameRole";
import {Director} from "../manager/Director";
import {TSMap} from "typescript-map";
import {PlayerToken} from "../model/PlayerToken";
import {PlayerManager} from "../manager/PlayerManager";
import {getLogger} from "../endpoint";
import {TokenManager} from "../manager/TokenManager";
import {GameManager} from "../manager/GameManager";

enum GameState {
  OPEN_WAITFORPLAYERS = "OPEN_WAITFORPLAYERS",
  OPEN_INPROGRESS = "OPEN_INPROGRESS",
  RESOLVED_FINALIZE = "RESOLVED_FINALIZE",
  RESOLVED_WAITFORTOKENRELEASE = "RESOLVED_WAITFORTOKENRELEASE"
}

export class Game {

  private token: Token;
  private state: GameState;
  private iteration: number;
  private host: Player | undefined;
  private players: Player[];
  private substate: SubState;
  private winningRole: GameRole;
  private maxNumberOfIncorrectGuesses: number;

  constructor() {
    this.state = GameState.OPEN_WAITFORPLAYERS;
    this.token = TokenBuilder.nullToken();
    this.iteration = 0;
    this.host = undefined;
    this.players = [];
    this.substate = SubState.PLAYERS_CHOOSING_WORDS;
    this.winningRole = GameRole.UNDECIDED;
    this.maxNumberOfIncorrectGuesses = 6;
  }

  /* Below method should only be called from Director */
  public addPlayer(player: Player): boolean {
    if (this.amountOfPlayersInGame() > 1) {
      return false; // Max. amount of players is 2
    }
    if (this.players.includes(player)) {
      return false;
    }
    this.players.push(player);
    this.increaseIteration();
    return true;
  }

  public amountOfPlayersInGame(): number {
    return this.players.length;
  }

  /* Below method should only be called from Director */
  public deletePlayer(player: Player): boolean {
    const indexOfPlayer: number = this.players.indexOf(player);
    if (indexOfPlayer < 0) {
      return false;
    }
    this.players.splice(indexOfPlayer, 1);
    this.increaseIteration();
    return true;
  }

  public getHost(): string {
    if (this.host === undefined) {
      return "";
    } else {
      return this.host.getToken().getToken();
    }
  }

  public getIteration(): number {
    return this.iteration;
  }

  public getMaxNumberOfIncorrectGuesses(): number {
    return this.maxNumberOfIncorrectGuesses;
  }

  public getToken(): GameToken {
    return this.token;
  }

  /* Increases the game iteration by 1. Please note: This triggers an update for all clients */
  public increaseIteration(): void {
    this.iteration ++;
  }

  public isFinished(): boolean {
    return this.state == GameState.RESOLVED_FINALIZE || this.state == GameState.RESOLVED_WAITFORTOKENRELEASE;
  }

  public playerCanJoin(): boolean {
    return this.state == GameState.OPEN_WAITFORPLAYERS;
  }

  public setHost(host: Player): Game {
    this.host = host;
    this.increaseIteration();
    return this;
  }

  public setNumberOfIncorrectGuesses(numberOfIncorrectGuesses: number) {
    this.maxNumberOfIncorrectGuesses = numberOfIncorrectGuesses;
    return this;
  }

  public setToken(token: GameToken): Game {
    this.token = token;
    return this;
  }

  public start(): boolean {
    if (this.state != GameState.OPEN_WAITFORPLAYERS) {
      return false;
    }

    this.state = GameState.OPEN_INPROGRESS;
    this.substate = SubState.PLAYERS_CHOOSING_WORDS;
    this.increaseIteration();
    return true;
  }

  public getState(): GameState {
    return this.state;
  }

  public getSubState(): SubState {
    return this.substate;
  }

  /**
   * Put gamestate to Finalized and define the winning role.
   *
   * @param winningRole Game Role that has won the game
   */
  public finish(winningRole: GameRole): Game {
    this.state = GameState.RESOLVED_FINALIZE;
    this.winningRole = winningRole;
    this.substate = SubState.GAME_FINISHED;
    this.increaseIteration();
    this.waitForTokenRelease();
    return this;
  }

  /**
   * Returns the game role that has won the game.
   * Please note; winning role = Undecided while there is no winner.--
   */
  public getWinningRole(): GameRole {
    return this.winningRole;
  }

  /**
   * Only to be used from Director after processing a guess from Player Two
   */
  public setSubStateToPlayerOne(): void {
    this.substate = SubState.PLAYER_ONE_CHOOSING;
  }

  /**
   * Only to be used from Director after processing a guess from Player One
   */
  public setSubStateToPlayerTwo(): void {
    this.substate = SubState.PLAYER_TWO_CHOOSING;
    this.increaseIteration();
  }

  /**
   * After one minute; change game state to 'Change To Token Release' and increase iteration one final time.
   * After one more minute, call cleanup and remove from token managers.
   */
  private async waitForTokenRelease(): Promise<void> {
    this.sleep(60000).then(() => {
      this.state = GameState.RESOLVED_WAITFORTOKENRELEASE;
      this.increaseIteration();
      this.sleep(60000).then(async () => {
        await this.players.forEach(player => {
          PlayerManager.get().deleteByToken(player.getToken());
          TokenManager.get().delete(player.getToken().getToken());
        });
        GameManager.get().deleteByToken(this.token);
        TokenManager.get().delete(this.token.getToken());
        Director.get().deleteGame(this.token);
        this.cleanup();
      });
    });
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * To be called on game deletion; resets all data to begin values
   * I.e. removes all references to other data
   */
  public cleanup(): Game {

    getLogger().debug("[Game " + this.token.getToken() + "] Cleanup started.");

    this.token = TokenBuilder.nullToken();
    this.host = undefined;
    this.players = [];

    return this;

  }
}
