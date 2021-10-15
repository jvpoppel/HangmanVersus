import {TSMap} from "typescript-map";
import {TokenUtil} from "../util/TokenUtil";
import {GameToken} from "../model/GameToken";
import {PlayerToken} from "../model/PlayerToken";
import {TokenBuilder} from "../data/TokenBuilder";
import {Token} from "../model/Token";
import {NullToken} from "../model/NullToken";
import {getLogger} from "../endpoint";

export class TokenManager {

  private tokenLength = 8;
  private static instance: TokenManager;
  private tokens: TSMap<string, Token>;

  private constructor() {
    this.tokens = new TSMap<string, Token>();
  }

  public static get(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  /**
   * Generates and returns a new, unique PlayerToken
   */
  public generatePlayerToken(): PlayerToken {
    let generatedToken: string = TokenUtil.generateToken(this.tokenLength);
    const generatedUUID: string = TokenUtil.generateToken(16);
    while (this.tokens.has(generatedToken)) {
      generatedToken = TokenUtil.generateToken(this.tokenLength);
    }
    const token: PlayerToken = new TokenBuilder()
      .setToken(generatedToken)
      .setUUID(generatedUUID)
      .forPlayer();

    getLogger().debug("[TokenManager] Generated token & uuid: " + generatedToken + ", " + generatedUUID);
    this.tokens.set(generatedToken, token);
    return token;
  }

  /**
   * Generates and returns a new, unique GameToken
   */
  public generateGameToken(): GameToken {
    let generatedToken: string = TokenUtil.generateToken(this.tokenLength);
    while (this.tokens.has(generatedToken)) {
      generatedToken = TokenUtil.generateToken(this.tokenLength);
    }
    const token: GameToken = new TokenBuilder()
      .setToken(generatedToken)
      .forGame();

    this.tokens.set(generatedToken, token);
    return token;
  }

  /**
   * Returns the token object based on token String. If there is no token with given identifier, return nullToken
   * @param givenToken token identifier
   */
  public getFromString(givenToken: string): Token {
    if (!this.tokens.has(givenToken)) {
      return TokenBuilder.nullToken();
    }
    return this.tokens.get(givenToken);
  }

  /**
   * Deletes the map entry of given token and return 'true' iff succeeded.
   */
  public delete(token: string): boolean {
    if (!this.tokens.has(token)) {
      return false;
    }
    return this.tokens.delete(token);
  }
}
