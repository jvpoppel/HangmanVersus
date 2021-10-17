import {GameManager} from "./GameManager";
import {Player} from "../data/Player";
import {Game} from "../data/Game";
import {PlayerManager} from "./PlayerManager";
import {GameToken} from "../model/GameToken";
import {PlayerToken} from "../model/PlayerToken";
import {TSMap} from "typescript-map";
import {getLogger} from "../endpoint";
import {TokenManager} from "./TokenManager";
import {FisherYatesShuffle} from "../util/FisherYatesShuffle";
import {GameRole} from "../model/GameRole";
import {IsGuessCorrect} from "../questions/IsGuessCorrect";
import {DidAllPlayersChooseAWord} from "../questions/DidAllPlayersChooseAWord";
import {SubState} from "../model/SubState";

export class Director {

  private static instance: Director;

  private playersInGame: TSMap<GameToken, Set<PlayerToken>>;

  private constructor() {
    this.playersInGame = new TSMap<GameToken, Set<PlayerToken>>();
  }

  public static get(): Director {
    if (!Director.instance) {
      Director.instance = new Director();
    }
    return Director.instance;
  }

  private isPlayerInGame(playerToken: PlayerToken, gameToken: GameToken): boolean {
    if (!this.playersInGame.has(gameToken)) {
      getLogger().info("Director does not have game " + gameToken.getToken());
      return false;
    }
    const players: Set<PlayerToken> = this.playersInGame.get(gameToken);
    if (!players.has(playerToken)) {
      getLogger().info("Director does not have player " + playerToken.getToken() + " in game " + gameToken.getToken());
      return false;
    }
    return true;
  }

  /**
   * Creates game and player, returns data object
   */
  public createGameForPlayer(playerName: string): TSMap<string, string> {
    const createdGame: Game = GameManager.get().create();
    const createdPlayer: Player = PlayerManager.get().create();
    createdPlayer.setName(playerName);
    createdGame.setHost(createdPlayer);

    getLogger().debug("[Director] Created game " + createdGame.getToken().getToken()
      + " for player " + createdPlayer.getToken().getToken());

    this.playersInGame.set(createdGame.getToken(), new Set<PlayerToken>().add(createdPlayer.getToken()));

    return new TSMap<string, string>().set("playerToken", createdPlayer.getToken().getToken())
      .set("gameToken", createdGame.getToken().getToken())
      .set("uuid", createdPlayer.getToken().getUUID());
  }

  public joinGameForPlayer(gameToken: GameToken, playerName: string): string | undefined {
    const resolvedGame: Game = GameManager.get().getByToken(gameToken);
    const newPlayer: Player = PlayerManager.get().create();
    newPlayer.setName(playerName);
    if (resolvedGame.addPlayer(newPlayer)) {
      this.playersInGame.get(gameToken).add(newPlayer.getToken());
      getLogger().debug("[Director] Added player " + newPlayer.getToken().getToken() + " to game " + gameToken.getToken());
      return JSON.stringify({"player": newPlayer.getToken().getToken(), "uuid": newPlayer.getToken().getUUID()});
    }
    getLogger().debug("[Director] Could not add player to game " + gameToken.getToken());
    return undefined;
  }

  /**
   * Method used for checking if player is in a game.
   * Use case: Player re-opens or refreshes browser.
   *
   * @param playerToken Player token from local storage
   * @param gameToken Game token from local storage
   */
  public checkIfPlayerInGame(playerToken: PlayerToken, gameToken: GameToken): GameToken | undefined {
    if (!this.isPlayerInGame(playerToken, gameToken)) {
      return undefined;
    }

    return gameToken;
  }

  public getPlayersInGame(gameToken: GameToken): Set<PlayerToken> | undefined {
    if (!this.playersInGame.has(gameToken)) {
      getLogger().info("Director does not have game " + gameToken.getToken());
      return undefined;
    }

    return this.playersInGame.get(gameToken);
  }

  public kickPlayerFromGame(playerToken: PlayerToken, gameToken: GameToken): boolean | undefined {
    getLogger().debug("[Director] Attempting to kick player " + playerToken.getToken() + " from game " + gameToken.getToken());
    if (!this.isPlayerInGame(playerToken, gameToken)) {
      getLogger().debug("[Director] Could not kick player " + playerToken.getToken() + " from game " + gameToken.getToken() + ": Player not in game.");
      return undefined;
    }

    // Special case: Game finished.
    // In this case, only return 'True', as end screen has to be intact for remaining players
    if (GameManager.get().getByToken(gameToken).isFinished()) {
      return true;
    }

    if (!GameManager.get().getByToken(gameToken).playerCanJoin()) {
      getLogger().debug("[Director] Could not kick player " + playerToken.getToken() + " from game " + gameToken.getToken() + ": Game already started!");
      return undefined;
    }

    // Player is in game, remove from PlayerManager & PlayersInGame and delete all token references.
    GameManager.get().getByToken(gameToken).deletePlayer(PlayerManager.get().getByToken(playerToken));
    PlayerManager.get().deleteByToken(playerToken);
    this.playersInGame.get(gameToken).delete(playerToken);
    TokenManager.get().delete(playerToken.getToken());
    return true;
  }

  public startGame(gameToken: GameToken): boolean | undefined {

    if (!GameManager.get().getByToken(gameToken).playerCanJoin()) {
      // Game has already been started, do nothing
      getLogger().info("[Director] Tried to start game " + gameToken.getToken() + " that has already been started.");
      return undefined;
    }
    this.divideRolesForGame(gameToken);
    return GameManager.get().getByToken(gameToken).start();
  }

  public getRoleOfPlayerAsPlayer(queryPlayer: Player, callingPlayer: Player): GameRole {
    if (callingPlayer === queryPlayer) {
      // A player is allowed to get their own role
      return callingPlayer.getRole();
    }
    if (callingPlayer.getRole() === GameRole.UNDECIDED) {
      // If roles have not yet been divided, return Undecided.
      return GameRole.UNDECIDED;
    }
    // If none of the above conditions apply, return Undecided.
    return GameRole.UNDECIDED;
  }

  /**
   * Given a game and it's designated narrator, give all players in game a random role.
   * @param gameToken Game to divide roles for
   * @param narrator Narrator of given game
   */
  public divideRolesForGame(gameToken: GameToken): void {

    const players: Array<Player> = new Array<Player>();
    const game: Game = GameManager.get().getByToken(gameToken);
    this.playersInGame.get(gameToken).forEach(function(playerToken) {
      players.push(PlayerManager.get().getByToken(playerToken));
    });

    let amountOfWolves = 1;
    //let amountOfCivilians = 0;
    let amountOfMediums = 0;
    if ((players.length - 1) >= 8) {
      amountOfWolves++; // Two wolves when players.size >= 8 and < 12
    }
    if ((players.length - 1) >= 12) {
      amountOfWolves++; // Three wolves when players.size >= 12
    }
    // Amount of civilians = #players - one narrator - amount of special-role-players (medium / wolf / etc)
    //amountOfCivilians = players.length - 1 - amountOfMediums - amountOfWolves;

    const shuffledPlayers: Player[] = FisherYatesShuffle<Player>(players);
    shuffledPlayers.forEach(function(player) {
      if (amountOfWolves > 0) {
        getLogger().debug("[Director] Given role WOLF to player " + player.getToken().getToken());
        player.setRole(GameRole.UNDECIDED);
        amountOfWolves--;
        return;
      }
      if (amountOfMediums > 0) {
        getLogger().debug("[Director] Given role MEDIUM to player " + player.getToken().getToken());
        player.setRole(GameRole.UNDECIDED);
        amountOfMediums--;
        return;
      }
      getLogger().debug("[Director] Given role CIVILIAN to player " + player.getToken().getToken());
      player.setRole(GameRole.UNDECIDED);
      return;
    });
  }

  /**
   * Set the chosen word for a player in a game
   */
  public setWordForPlayer(playerToken: PlayerToken, gameToken: GameToken, chosenWord: string): boolean | undefined {
    if (!this.isPlayerInGame(playerToken, gameToken)) {
      getLogger().debug("[Director] Could not set word for " + playerToken.getToken() + " in game " + gameToken.getToken() + ": Player not in game.");
      return undefined;
    }
    if (PlayerManager.get().getByToken(playerToken).getWord() != "") {
      return false;
    }

    PlayerManager.get().getByToken(playerToken).setWord(chosenWord);
    if (DidAllPlayersChooseAWord.askedBy(playerToken).inGame(gameToken)) {
      GameManager.get().getByToken(gameToken).setSubStateToPlayerOne();
      GameManager.get().getByToken(gameToken).increaseIteration();
    }
    return true;
  }

  /**
   * Add a guess for player
   */
  public addGuessForPlayer(playerToken: PlayerToken, gameToken: GameToken, guess: string): boolean | undefined {
    if (!this.isPlayerInGame(playerToken, gameToken)) {
      getLogger().debug("[Director] Could not add guess for " + playerToken.getToken() + " in game " + gameToken.getToken() + ": Player not in game.");
      return undefined;
    }

    if (guess.length != 1) {
      getLogger().debug("[Director] Could not add guess for " + playerToken.getToken() + " in game " + gameToken.getToken() + ": Guess not of length 1.");
      return undefined;
    }

    PlayerManager.get().getByToken(playerToken).addGuess(guess);
    if (!IsGuessCorrect.askedBy(playerToken).inGame(gameToken).guessing(guess)) {
      PlayerManager.get().getByToken(playerToken).increaseIncorrectGuesses();
    }
    const game = GameManager.get().getByToken(gameToken);
    if (game.getSubState() === SubState.PLAYER_ONE_CHOOSING) {
      game.setSubStateToPlayerTwo();
    } else if (game.getSubState() === SubState.PLAYER_TWO_CHOOSING) {
      game.setSubStateToPlayerOne();
    }
    game.increaseIteration();
    return true;
  }

}
