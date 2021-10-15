import {Validation} from "../Validation";

export enum AuthErrorResponse {
  UNKNOWN_TOKEN,
  WRONG_UUID,
  NOT_IN_GAME
}

export class AuthSuccessResponse {

  constructor () {
    // Empty class
  }
}

export class AuthResponse {

  private readonly content: AuthSuccessResponse | AuthErrorResponse;

  constructor(content: AuthSuccessResponse | AuthErrorResponse) {
    this.content = content;
  }

  public body(): Validation {
    if (this.content instanceof AuthSuccessResponse) {
      return {"status": 200, "message": "OK"};
    } else {
      switch (this.content) {
      case AuthErrorResponse.NOT_IN_GAME:
        return {"status": 401, "message": "Game does not have given player in its players"};
      case AuthErrorResponse.WRONG_UUID:
        return {"status": 401, "message": "Player not authorized"};
      case AuthErrorResponse.UNKNOWN_TOKEN:
        return {"status": 401, "message": "One of the provided tokens is not valid"};
      }
    }
  }

}
