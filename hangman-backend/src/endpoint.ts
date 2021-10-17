import {Logger} from "winston";
import express = require("express");
import {apiCreateGame} from "./api/APICreateGame";
import {apiStartGame} from "./api/APIStartGame";
import {apiJoinGame} from "./api/APIJoinGame";
import {apiReconnectGame} from "./api/APIReconnectGame";
import { Config } from "./Config";
import {TSMap} from "typescript-map";
import {apiGetGameIteration} from "./api/APIGetGameIteration";
import {apiGetGameData} from "./api/APIGetGameData";
import {apiKickPlayer} from "./api/APIKickPlayer";
import {apiDisconnectPlayer} from "./api/APIDisconnectPlayer";
import {validateParams} from "./api/validators/ParamsValidator";
import {Validation} from "./api/Validation";
import {AuthResponse} from "./api/responses/AuthResponse";
import {AuthValidator} from "./api/validators/AuthValidator";
import {InternalAPIReturns} from "./api/responses/InternalAPIReturns";
import {apiChooseWord} from "./api/APIChooseWord";
import {apiGuess} from "./api/APIGuess";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const winston = require("winston");

const app = express();
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

// eslint-disable-next-line @typescript-eslint/no-var-requires
const config: Config = require("./../config.json");

const logger = winston.createLogger({
  level: "debug",
  format: winston.format.json(),
  defaultMeta: {service: "user-service"},
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    new winston.transports.File({filename: "error.log", level: "error"}),
    new winston.transports.File({filename: "combined.log"}),
  ],
});

logger.add(new winston.transports.Console({
  format: winston.format.simple(),
}));

app.use(express.static(__dirname + "/../../hangman-frontend/dist/hangman-frontend/"));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/../../hangman-frontend/dist/hangman-frontend/index.html"));
});

/*

            START API ROUTING

 */
/*
  Create game, return created playerToken and gameToken
 */
app.post("/api/game/create", function (req, res) {
  logger.info("[EXPRESS] Creating new game");
  const paramsValidation: Validation | undefined = validateParams(req.body.playerName).body();
  if (paramsValidation !== undefined) {
    res.status(paramsValidation.status).send(JSON.stringify(paramsValidation));
    return;
  }

  const response: TSMap<string, string> = apiCreateGame(req.body.playerName);
  res.status(201).send(JSON.stringify({
    "playerToken": response.get("playerToken"),
    "gameToken": response.get("gameToken"),
    "uuid": response.get("uuid")}));
});

/*
  Join game for player, return joined gameToken and created playerToken
 */
app.post("/api/game/join", function(req, res) {
  logger.info("[EXPRESS] Attempting to join game " + req.body.gameToken);
  const paramsValidation: Validation | undefined = validateParams(req.body.gameToken, req.body.playerName).body();
  if (paramsValidation !== undefined) {
    res.status(paramsValidation.status).send(JSON.stringify(paramsValidation));
    return;
  }
  const authValidation: Validation = new AuthResponse(AuthValidator.ValidateGame(req.body.gameToken)).body();
  if (authValidation.status != 200) {
    res.status(authValidation.status).send(JSON.stringify(authValidation));
    return;
  }

  const gameResponse = apiJoinGame(req.body.gameToken, req.body.playerName);
  if (gameResponse == undefined) {
    res.status(400).send(JSON.stringify({"status": "failed"}));
  } else {
    res.status(200).send(gameResponse); // Return player token
  }
});

/*
  Reconnect to game with given gameToken and playerToken, "success" if succeeded, "failed" otherwise.
 */
app.post("/api/game/reconnect", function(req, res) {
  logger.info("[EXPRESS] Player " + req.body.playerToken + " is attempting to rejoin game " + req.body.gameToken);

  const authValidation: Validation = new AuthResponse(AuthValidator.ValidatePlayer(req.body.playerToken, req.body.uuid, req.body.gameToken)).body();
  if (authValidation.status != 200) {
    res.status(authValidation.status).send(JSON.stringify(authValidation));
    return;
  }

  const gameResponse = apiReconnectGame(req.body.playerToken, req.body.gameToken);

  if (gameResponse == undefined) {
    res.status(200).send(JSON.stringify({"status": 401, "connected": "failed"}));
  } else {
    res.status(200).send(JSON.stringify({"status": 200, "connected": "success"})); // Return game token
  }
});

/*
  GET iteration of given gameToken. Playertoken also sent to check if player actually is in game
 */
app.get("/api/game/:gametoken/:playertoken/iteration", function(req, res) {
  const response: string = apiGetGameIteration(req.params.gametoken, req.params.playertoken);
  if (response === "-1") {
    res.status(400).send(JSON.stringify({"iteration": response}));
  } else {
    res.status(200).send(JSON.stringify({"iteration": response}));
  }
});

/*
  POST get Game Data, given a gametoken, playertoken and client-iteration, return:
  status 304 iff clientIteration = serverIteration
  status 400 iff gameToken or playerToken incorrect
  status 200 with gameData in json format
 */
app.post("/api/game/:gametoken/:playertoken/data", function(req, res) {
  const paramsValidation: Validation | undefined = validateParams(req.params.playertoken, req.params.gametoken, req.body.uuid, req.body.iteration).body();
  if (paramsValidation !== undefined) {
    res.status(paramsValidation.status).send(JSON.stringify(paramsValidation));
    return;
  }
  const authValidation: Validation = new AuthResponse(AuthValidator.ValidatePlayer(req.params.playertoken, req.body.uuid, req.params.gametoken)).body();
  if (authValidation.status != 200) {
    res.status(authValidation.status).send(JSON.stringify(authValidation));
    return;
  }

  const response: any = apiGetGameData(req.params.gametoken, req.params.playertoken, req.body.iteration);
  if (response === "failed") {
    res.status(400).send(JSON.stringify({"status": "failed"}));
  } else if (response === "notChanged") {
    res.status(304);
  } else {
    res.status(200).json(response);
  }
});
/*
  POST kick Player from Game.
  status 401 iff supposedHost != host of given game
  status 400 iff playerToken or gameToken not valid, or if player not in game.
  status 200 iff player has been kicked from the game.
 */
app.post("/api/game/:gametoken/:playertoken/kick", function(req, res) {
  logger.info("[EXPRESS] Player " + req.body.host + " attempts to kick " + req.params.playertoken + " from game " + req.params.gametoken);
  const paramsValidation: Validation | undefined = validateParams(req.params.playertoken, req.params.gametoken, req.body.uuid, req.body.host).body();
  if (paramsValidation !== undefined) {
    res.status(paramsValidation.status).send(JSON.stringify(paramsValidation));
    return;
  }
  const authValidation: Validation = new AuthResponse(AuthValidator.ValidatePlayer(req.body.host, req.body.uuid, req.params.gametoken)).body();
  if (authValidation.status != 200) {
    res.status(authValidation.status).send(JSON.stringify(authValidation));
    return;
  }

  const response: string = apiKickPlayer(req.params.playertoken, req.body.host, req.params.gametoken);
  if (response === "unauthorized") {
    res.status(401).send(JSON.stringify({"status": "failed"}));
  } else if (response === "failed") {
    res.status(400).send(JSON.stringify({"status": "failed"}));
  } else {
    res.status(200).send(JSON.stringify({"status": "success"}));
  }
});

/*
  POST set word for player.
  status 400 iff playerToken or gameToken not valid, or if player not in game.
  status 401 iff player has already given a word
  status 200 iff player has set a word
 */
app.post("/api/game/:gametoken/:playertoken/word", function(req, res) {
  logger.info("[EXPRESS] Player " + req.params.playertoken  + " from game " + req.params.gametoken + " attempts to set word " + req.body.word);
  const paramsValidation: Validation | undefined = validateParams(req.params.playertoken, req.params.gametoken, req.body.uuid, req.body.word).body();
  if (paramsValidation !== undefined) {
    res.status(paramsValidation.status).send(JSON.stringify(paramsValidation));
    return;
  }
  const authValidation: Validation = new AuthResponse(AuthValidator.ValidatePlayer(req.params.playertoken, req.body.uuid, req.params.gametoken)).body();
  if (authValidation.status != 200) {
    res.status(authValidation.status).send(JSON.stringify(authValidation));
    return;
  }

  const response: string = apiChooseWord(req.params.playertoken, req.params.gametoken, req.body.word);
  if (response === "unauthorized") {
    res.status(401).send(JSON.stringify({"status": "failed"}));
  } else if (response === "failed") {
    res.status(400).send(JSON.stringify({"status": "failed"}));
  } else {
    res.status(200).send(JSON.stringify({"status": "success"}));
  }
});

/*
  POST add guess for player.
  status 400 iff playerToken or gameToken not valid, or if player not in game.
  status 200 iff player has set a word
 */
app.post("/api/game/:gametoken/:playertoken/guess", function(req, res) {
  logger.info("[EXPRESS] Player " + req.params.playertoken  + " from game " + req.params.gametoken + " attempts to guess " + req.body.guess);
  const paramsValidation: Validation | undefined = validateParams(req.params.playertoken, req.params.gametoken, req.body.uuid, req.body.guess).body();
  if (paramsValidation !== undefined) {
    res.status(paramsValidation.status).send(JSON.stringify(paramsValidation));
    return;
  }
  const authValidation: Validation = new AuthResponse(AuthValidator.ValidatePlayer(req.params.playertoken, req.body.uuid, req.params.gametoken)).body();
  if (authValidation.status != 200) {
    res.status(authValidation.status).send(JSON.stringify(authValidation));
    return;
  }

  const response: string = apiGuess(req.params.playertoken, req.params.gametoken, req.body.guess);
  if (response === "unauthorized") {
    res.status(401).send(JSON.stringify({"status": "failed"}));
  } else if (response === "failed") {
    res.status(400).send(JSON.stringify({"status": "failed"}));
  } else {
    res.status(200).send(JSON.stringify({"status": "success"}));
  }
});

/*
  PUT disconnect player from game. Initiated by players themselves, no need for check on host.
  status 400 if one of the tokens is not valid or player is not in game,
  status 200 iff player has been disconnected from game.
 */
app.put("/api/game/:gametoken/:playertoken/disconnect", function(req, res) {
  logger.info("[EXPRESS] Player " + req.params.playertoken + " attempts to disconnect from game " + req.params.gametoken);
  const paramsValidation: Validation | undefined = validateParams(req.params.playertoken, req.params.gametoken, req.body.uuid).body();
  if (paramsValidation !== undefined) {
    res.status(paramsValidation.status).send(JSON.stringify(paramsValidation));
    return;
  }

  const authValidation: Validation = new AuthResponse(AuthValidator.ValidatePlayer(req.params.playertoken, req.body.uuid, req.params.gametoken)).body();
  if (authValidation.status != 200) {
    res.status(authValidation.status).send(JSON.stringify(authValidation));
    return;
  }

  const response: string = apiDisconnectPlayer(req.params.playertoken, req.params.gametoken);
  if (response === "failed") {
    res.status(400).send(JSON.stringify({"status": "failed"}));
  } else {
    res.status(200).send(JSON.stringify({"status": "success"}));
  }
});

/*
  PUT start game. Initiated by host.
  status 400 if one of the tokens is not valid or player is not in game,
  status 200 iff player has been disconnected from game.
 */
app.put("/api/game/:gametoken/start", function(req, res) {
  logger.info("[EXPRESS] Player " + req.body.host + " attempts to start game " + req.params.gametoken);
  const paramsValidation: Validation | undefined = validateParams(req.params.gametoken, req.body.uuid, req.body.host).body();
  if (paramsValidation !== undefined) {
    res.status(paramsValidation.status).send(JSON.stringify(paramsValidation));
    return;
  }

  const authValidation: Validation = new AuthResponse(AuthValidator.ValidatePlayer(req.body.host, req.body.uuid, req.params.gametoken)).body();
  if (authValidation.status != 200) {
    res.status(authValidation.status).send(JSON.stringify(authValidation));
    return;
  }

  const response: string = apiStartGame(req.body.host, req.params.gametoken);
  if (response === "unauthorized") {
    res.status(401).send(JSON.stringify({"status": "failed"}));
  } else if (response === "failed") {
    res.status(400).send(JSON.stringify({"status": "failed"}));
  } else {
    res.status(200).send(JSON.stringify({"status": "success"}));
  }
});
/*

            START GENERAL HTML ROUTING

*/
app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname + "/../../hangman-frontend/dist/hangman-frontend/index.html"));
});

app.listen(config.port, function () {
  logger.info("App is listening on port {0}!".replace("{0}", config.port+""));
});

/*

            END GENERAL HTML ROUTING

 */
export function getLogger(): Logger {
  return logger;
}

export default app;
