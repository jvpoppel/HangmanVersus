export class WebElements {

  /* Loading */
  public static LOADING_PAGE(): HTMLElement { return document.getElementById("container-loading");}

  /* Home page */
  public static HOME_PAGE(): HTMLElement { return document.getElementById("container-home");}
  public static CREATE_GAME(): HTMLElement { return document.getElementById("createBtn");}
  public static JOIN_TOKEN(): HTMLElement { return document.getElementById("joinGameToken");}
  public static JOIN_BUTTON(): HTMLElement { return document.getElementById("joinBtn");}
  public static PLAYER_NAME(): HTMLElement { return document.getElementById("playerName");}

  /* Game page */
  public static GAME_PAGE(): HTMLElement { return document.getElementById("container-game");}
  public static ROLE_INFO_BUTTON(): HTMLElement { return document.getElementById("showRoleInfo");}
  public static GAME_CODE(): HTMLElement { return document.getElementById("gameCode");}
  public static PLAYER_LIST_HOST(): HTMLElement { return document.getElementById("playerListForHost");}
  public static PLAYER_LIST_PLAYER(): HTMLElement { return document.getElementById("playerListForPlayers");}
  public static PLAYER_LIST_BODY_HOST(): HTMLElement { return document.getElementById("player-list-body-host");}
  public static PLAYER_LIST_BODY_PLAYER(): HTMLElement { return document.getElementById("player-list-body-player");}
  public static KICK_PLAYER(playerToken: string): HTMLElement { return document.getElementById(playerToken + "-kick");}
  public static START_DISCONNECT_BUTTONS(): HTMLElement { return document.getElementById("row-player-startstop");}
  public static DISCONNECT(): HTMLElement { return document.getElementById("disconnect");}
  public static DISCONNECT_AFTER_WIN(): HTMLElement { return document.getElementById("disconnectWin");}
  public static START(): HTMLElement { return document.getElementById("start");}
  public static SUBSTATE_ROW(): HTMLElement { return document.getElementById("row-substate");}
  public static SUBSTATE_VALUE(): HTMLElement { return document.getElementById("subState");}
  public static WINNER_ROW(): HTMLElement { return document.getElementById("row-win");}
  public static WINNER_VALUE(): HTMLElement { return document.getElementById("winningRole");}

  public static HOST_OPTIONS(): HTMLElement { return document.getElementById("row-host-options");}
  public static HOST_OPTION_MAXINCORRECT(): HTMLElement { return document.getElementById("nrIncorrectGuesses"); }

  public static WORD_SELECTION_SECTION(): HTMLElement { return document.getElementById("row-choose-word")}
  public static WORD_INPUT(): HTMLElement { return document.getElementById("wordInput")}
  public static WORD_SUBMIT(): HTMLElement { return document.getElementById("wordSubmit")}

  public static GUESS_SELECTION_SECTION(): HTMLElement { return document.getElementById("row-guess")}
  public static GUESS_INPUT(): HTMLElement { return document.getElementById("guessInput")}
  public static GUESS_SUBMIT(): HTMLElement { return document.getElementById("guessSubmit")}

  public static WORD_SECTION(): HTMLElement { return document.getElementById("row-playersections")}
  public static OWN_CHOSEN_WORD(): HTMLElement { return document.getElementById("ownWord")}
  public static GUESSES_OWN_WORD(): HTMLElement { return document.getElementById("guessesMyWord")}
  public static OWN_INCORRECT_GUESSES(): HTMLElement { return document.getElementById("ownIncorrectGuesses")}
  public static GUESSES_OPPONENT_WORD(): HTMLElement { return document.getElementById("guessesOpponentWord")}
  public static OPPONENT_INCORRECT_GUESSES(): HTMLElement { return document.getElementById("theirIncorrectGuesses")}
  public static OPPONENT_WORD(): HTMLElement { return document.getElementById("theirWord")}
}
