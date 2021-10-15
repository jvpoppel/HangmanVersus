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
import {Token} from "../model/Token";

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
    const newPlayer: Player = PlayerManager.get().create();
    newPlayer.setName(playerName);
    if (GameManager.get().getByToken(gameToken).addPlayer(newPlayer)) {
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

  public startGameWithNarrator(gameToken: GameToken, narrator: PlayerToken): boolean | undefined {

    if (!GameManager.get().getByToken(gameToken).playerCanJoin()) {
      // Game has already been started, do nothing
      getLogger().info("[Director] Tried to start game " + gameToken.getToken() + " that has already been started.");
      return undefined;
    }
    this.divideRolesForGame(gameToken, narrator);
    return GameManager.get().getByToken(gameToken).start();
  }

  public getRoleOfPlayerAsPlayer(queryPlayer: Player, callingPlayer: Player): GameRole {
    if (!callingPlayer.isAlive()) {
      // Dead players and the narrator can see every role
      return queryPlayer.getRole();
    }
    if (callingPlayer === queryPlayer) {
      // A player is allowed to get their own role
      return callingPlayer.getRole();
    }
    if (!queryPlayer.isAlive()) {
      // A player is allowed to see the roles of dead people
      return queryPlayer.getRole();
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
  public divideRolesForGame(gameToken: GameToken, narrator: PlayerToken): void {

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
   * AlivePlayersPerRoleInGame -> Returns a map, key = GameRole, value = amount of players with given role in game.
   * To be used from a Game instance; thus no check on existance of game.
   *
   * @param gameToken Game Token of game to check
   */
  public alivePlayersPerRoleInGame(gameToken: GameToken): TSMap<GameRole, number> {
    const toReturn = new TSMap<GameRole, number>();
    this.playersInGame.get(gameToken).forEach(function(playerToken: PlayerToken) {
      const player: Player = PlayerManager.get().getByToken(playerToken);
      if (!player.isAlive()) {
        return;
      }
      if (toReturn.has(player.getRole())) {
        toReturn.set(player.getRole(), toReturn.get(player.getRole()) + 1); // Increase current value
      } else {
        toReturn.set(player.getRole(), 1); // First instance of role, set to 1.
      }
    });
    return toReturn;
  }

}
