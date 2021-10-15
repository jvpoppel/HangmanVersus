// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
import {MissingParamResponse, ParamsError} from "../responses/MissingParamResponse";

export function validateParams(...params: any[]): MissingParamResponse {
  let missingParams = 0;
  for (let i=0; i<params.length; i++) {
    if (params[i] === undefined) {
      missingParams++;
    }
  }

  if (missingParams > 0) {
    return new MissingParamResponse(new ParamsError(params.length, params.length - missingParams));
  }
  return new MissingParamResponse(undefined);

}
