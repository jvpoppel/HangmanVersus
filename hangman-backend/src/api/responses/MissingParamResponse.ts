import {Validation} from "../Validation";

export class ParamsError {

  private response: Validation;

  constructor (expectedAmount: number, actualAmount: number) {
    this.response = {
      "status": 400, "message": "Wrong amount of parameters, expected {0}, got {1}."
        .replace("{0}", expectedAmount+"").replace("{1}", actualAmount+"")
    };
  }

  public getResponse(): Validation {
    return this.response;
  }
}

export class MissingParamResponse {

  private readonly content: ParamsError | undefined;

  constructor(content: ParamsError | undefined) {
    this.content = content;
  }

  public body(): Validation | undefined {
    if (this.content === undefined) {
      return undefined;
    }
    return this.content.getResponse();
  }

}
