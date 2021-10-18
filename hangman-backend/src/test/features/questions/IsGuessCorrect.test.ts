import chai from "chai";
import "mocha";
import {GameManager} from "../../../manager/GameManager";
import {Token} from "../../../model/Token";
import {TokenManager} from "../../../manager/TokenManager";
import {GameToken} from "../../../model/GameToken";
import {Game} from "../../../data/Game";
import {Director} from "../../../manager/Director";
import {PlayerToken} from "../../../model/PlayerToken";
import {PlayerManager} from "../../../manager/PlayerManager";
import {IsGuessCorrect} from "../../../questions/IsGuessCorrect";

describe("IsGuessCorrect tests", () => {
  it("Guess wrong", async () => {

    const gameData = Director.get().createGameForPlayer("Player1");
    const createdGame = GameManager.get().getByToken(TokenManager.get().getFromString(gameData.get("gameToken")));
    if (createdGame === undefined) {
      chai.expect(true).to.be.false;
      return;
    }

    // Add second players to game
    Director.get().joinGameForPlayer(createdGame.getToken(),"Player2");

    const playersInGame: Set<PlayerToken> | undefined = Director.get().getPlayersInGame(createdGame.getToken());
    chai.expect(playersInGame).to.not.be.undefined;

    const playersArray: PlayerToken[] = Array.from((playersInGame as Set<PlayerToken>));
    const playerOne = PlayerManager.get().getByToken(playersArray[0]);
    const playerTwo = PlayerManager.get().getByToken(playersArray[1]);
    createdGame.setHost(playerOne);
    playerOne.setWord("abcde");
    playerTwo.setWord("ghijk");

    // Questions
    chai.expect(
      IsGuessCorrect.askedBy(playerOne.getToken()).inGame(createdGame.getToken()).guessing("a")
    ).to.be.false;

    chai.expect(
      IsGuessCorrect.askedBy(playerTwo.getToken()).inGame(createdGame.getToken()).guessing("g")
    ).to.be.false;

  });

  it("Guess correct", async () => {

    const gameData = Director.get().createGameForPlayer("Player1");
    const createdGame = GameManager.get().getByToken(TokenManager.get().getFromString(gameData.get("gameToken")));
    if (createdGame === undefined) {
      chai.expect(true).to.be.false;
      return;
    }

    // Add second players to game
    Director.get().joinGameForPlayer(createdGame.getToken(),"Player2");

    const playersInGame: Set<PlayerToken> | undefined = Director.get().getPlayersInGame(createdGame.getToken());
    chai.expect(playersInGame).to.not.be.undefined;

    const playersArray: PlayerToken[] = Array.from((playersInGame as Set<PlayerToken>));
    const playerOne = PlayerManager.get().getByToken(playersArray[0]);
    const playerTwo = PlayerManager.get().getByToken(playersArray[1]);
    createdGame.setHost(playerOne);
    playerOne.setWord("abcde");
    playerTwo.setWord("ghijk");

    // Questions
    chai.expect(
      IsGuessCorrect.askedBy(playerOne.getToken()).inGame(createdGame.getToken()).guessing("g")
    ).to.be.true;

    chai.expect(
      IsGuessCorrect.askedBy(playerTwo.getToken()).inGame(createdGame.getToken()).guessing("a")
    ).to.be.true;

  });
});
