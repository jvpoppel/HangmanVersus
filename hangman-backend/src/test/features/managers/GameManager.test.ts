import chai from "chai";
import "mocha";
import {Token} from "../../../model/Token";
import {TokenManager} from "../../../manager/TokenManager";
import {GameToken} from "../../../model/GameToken";
import {Game} from "../../../data/Game";
import {GameManager} from "../../../manager/GameManager";

describe("Game Manager", () => {
  it("Create game and fetch by string", async () => {

    const createdGame: Game = GameManager.get().create();
    const gameToken: string = createdGame.getToken().getToken();
    chai.expect(gameToken.length).to.be.equal(8); // TODO: Change to config value

    const fetchedToken: Token = TokenManager.get().getFromString(gameToken);
    chai.expect(fetchedToken).instanceOf(GameToken);
    chai.expect(fetchedToken.isGameToken()).to.be.true;
    chai.expect(fetchedToken.isPlayerToken()).to.be.false;
    chai.expect(fetchedToken.isNullToken()).to.be.false;
  });
});
