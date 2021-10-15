import chai from "chai";
import "mocha";
import {Token} from "../../../model/Token";
import {TokenManager} from "../../../manager/TokenManager";
import {GameToken} from "../../../model/GameToken";
import {PlayerToken} from "../../../model/PlayerToken";
import {NullToken} from "../../../model/NullToken";

describe("Token Manager", () => {
  it("Create game and fetch by string", async () => {

    const createdToken: Token = TokenManager.get().generateGameToken();
    const tokenValue: string = createdToken.getToken();
    chai.expect(tokenValue.length).to.be.equal(8); // TODO: Change to config value

    const gameToken: Token = TokenManager.get().getFromString(tokenValue);
    chai.expect(gameToken).instanceOf(GameToken);
    chai.expect(gameToken.isGameToken()).to.be.true;
    chai.expect(gameToken.isPlayerToken()).to.be.false;
    chai.expect(gameToken.isNullToken()).to.be.false;
  });

  it("Create player and fetch by string", async () => {

    const createdToken: Token = TokenManager.get().generatePlayerToken();
    const tokenValue: string = createdToken.getToken();
    chai.expect(tokenValue.length).to.be.equal(8); // TODO: Change to config value

    const playerToken: Token = TokenManager.get().getFromString(tokenValue);
    chai.expect(playerToken).instanceOf(PlayerToken);
    chai.expect(playerToken.isGameToken()).to.be.false;
    chai.expect(playerToken.isPlayerToken()).to.be.true;
    chai.expect(playerToken.isNullToken()).to.be.false;
  });

  it("Fetch non-existent token", async () => {

    const fetchedToken : Token = TokenManager.get().getFromString("abcd");
    chai.expect(fetchedToken).instanceOf(NullToken);
    chai.expect(fetchedToken.isGameToken()).to.be.false;
    chai.expect(fetchedToken.isPlayerToken()).to.be.false;
    chai.expect(fetchedToken.isNullToken()).to.be.true;
  });
});
