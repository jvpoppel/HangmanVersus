import chai from "chai";
import "mocha";
import {GameManager} from "../../../manager/GameManager";
import {Token} from "../../../model/Token";
import {TokenManager} from "../../../manager/TokenManager";
import {GameToken} from "../../../model/GameToken";
import {Game} from "../../../data/Game";

describe("Basic game flows", () => {
  it("Create and start game", async () => {

    const createdGame: Game = GameManager.get().create();
    const token: string = createdGame.getToken().getToken();
    chai.expect(token.length).to.be.equal(8); // TODO: Change to config value

    const gameToken: Token = TokenManager.get().getFromString(token);
    chai.expect(gameToken).instanceOf(GameToken);

    chai.expect(GameManager.get().getByToken(gameToken).getState()).to.be.equal("OPEN_WAITFORPLAYERS");

    createdGame.start();

    chai.expect(GameManager.get().getByToken(gameToken).getState()).to.be.equal("OPEN_INPROGRESS");

  });
});
