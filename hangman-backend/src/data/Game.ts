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

  constructor() {
    this.state = GameState.OPEN_WAITFORPLAYERS;
    this.token = TokenBuilder.nullToken();
    this.iteration = 0;
    this.host = undefined;
    this.players = [];
    this.substate = SubState.PLAYERS_CHOOSING_WORDS;
    this.winningRole = GameRole.UNDECIDED;
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


  public checkWinConditions(): void {

    // TODO: Define
    // i.e. this.finish(GameRole.PLAYER_ONE);
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
   * To be called on game deletion; resets all data to begin values
   * I.e. removes all references to other data
   */
  public cleanup(): Game {

    this.token = TokenBuilder.nullToken();
    this.host = undefined;
    this.players = [];

    return this;

  }
}
