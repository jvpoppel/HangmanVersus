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
import {DidAllPlayersChooseAWord} from "../../../questions/DidAllPlayersChooseAWord";

describe("DidAllPlayersChooseAWord tests", () => {
  it("Not all players picked", async () => {

    const gameData = Director.get().createGameForPlayer("Player1");
    const createdGame = GameManager.get().getByToken(TokenManager.get().getFromString(gameData.get("gameToken")));

    // Add second players to game
    Director.get().joinGameForPlayer(createdGame.getToken(),"Player2");

    const playersInGame: Set<PlayerToken> | undefined = Director.get().getPlayersInGame(createdGame.getToken());
    chai.expect(playersInGame).to.not.be.undefined;

    const playersArray: PlayerToken[] = Array.from((playersInGame as Set<PlayerToken>));
    const playerOne = PlayerManager.get().getByToken(playersArray[0]);
    const playerTwo = PlayerManager.get().getByToken(playersArray[1]);
    createdGame.setHost(playerOne);
    playerOne.setWord("abcde");

    // Only player one chose a word
    chai.expect(
      DidAllPlayersChooseAWord.askedBy(playerOne.getToken()).inGame(createdGame.getToken())
    ).to.be.false;

    chai.expect(
      DidAllPlayersChooseAWord.askedBy(playerTwo.getToken()).inGame(createdGame.getToken())
    ).to.be.false;

    // No word at all chosen
    playerOne.setWord("");
    chai.expect(
      DidAllPlayersChooseAWord.askedBy(playerOne.getToken()).inGame(createdGame.getToken())
    ).to.be.false;

    chai.expect(
      DidAllPlayersChooseAWord.askedBy(playerTwo.getToken()).inGame(createdGame.getToken())
    ).to.be.false;

    // Player two only had a word chosen
    playerTwo.setWord("def");
    chai.expect(
      DidAllPlayersChooseAWord.askedBy(playerOne.getToken()).inGame(createdGame.getToken())
    ).to.be.false;

    chai.expect(
      DidAllPlayersChooseAWord.askedBy(playerTwo.getToken()).inGame(createdGame.getToken())
    ).to.be.false;

  });

  it("All players chose a word", async () => {

    const gameData = Director.get().createGameForPlayer("Player1");
    const createdGame = GameManager.get().getByToken(TokenManager.get().getFromString(gameData.get("gameToken")));

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
      DidAllPlayersChooseAWord.askedBy(playerTwo.getToken()).inGame(createdGame.getToken())
    ).to.be.true;

  });
});
