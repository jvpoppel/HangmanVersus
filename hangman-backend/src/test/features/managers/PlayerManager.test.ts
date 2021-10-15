import chai from "chai";
import "mocha";
import {Token} from "../../../model/Token";
import {TokenManager} from "../../../manager/TokenManager";
import {Player} from "../../../data/Player";
import {PlayerManager} from "../../../manager/PlayerManager";
import {PlayerToken} from "../../../model/PlayerToken";

describe("Player Manager", () => {
  it("Create player and fetch by string", async () => {

    const createdPlayer: Player = PlayerManager.get().create();
    const playerToken: string = createdPlayer.getToken().getToken();
    chai.expect(playerToken.length).to.be.equal(8); // TODO: Change to config value

    const fetchedToken: Token = TokenManager.get().getFromString(playerToken);
    chai.expect(fetchedToken).instanceOf(PlayerToken);
    chai.expect(fetchedToken.isPlayerToken()).to.be.true;
    chai.expect(fetchedToken.isGameToken()).to.be.false;
    chai.expect(fetchedToken.isNullToken()).to.be.false;
  });
});
