import {WebElements} from "./WebElements";

export class DisplayManager {

  public static LoadingToHome(): void {
    WebElements.LOADING_PAGE().style.display = "none";
    WebElements.HOME_PAGE().style.display = "";
  }

  public static ShowCorrectPlayerList(forHost: boolean): void {
    if (forHost) {
      WebElements.PLAYER_LIST_HOST().style.display = "";
      WebElements.PLAYER_LIST_PLAYER().style.display = "none";
    } else {
      WebElements.PLAYER_LIST_HOST().style.display = "none";
      WebElements.PLAYER_LIST_PLAYER().style.display = "";
    }
  }

  public static LoadingToGame(): void {
    WebElements.LOADING_PAGE().style.display = "none";
    WebElements.GAME_PAGE().style.display = "";
    WebElements.START_DISCONNECT_BUTTONS().style.display = "";
    WebElements.START().style.display = "none";
  }

  public static HomePageToGame(): void {
    WebElements.HOME_PAGE().style.display = "none";
    WebElements.GAME_PAGE().style.display = "";
    WebElements.START_DISCONNECT_BUTTONS().style.display = "";
    WebElements.START().style.display = "none";
  }

  public static UpdateGameCode(code: string): void {
    WebElements.GAME_CODE().innerText = code;
  }

  public static UpdateGameSubState(substate: string): void {
    WebElements.SUBSTATE_ROW().style.display = "";
    WebElements.SUBSTATE_VALUE().innerHTML = substate;
  }

  public static GameToHomePage(): void {
    WebElements.HOME_PAGE().style.display = "";
    WebElements.GAME_PAGE().style.display = "none";
    WebElements.PLAYER_LIST_BODY_HOST().innerHTML = "";
    WebElements.PLAYER_LIST_BODY_PLAYER().innerHTML = "";
    WebElements.SUBSTATE_ROW().style.display = "none";
    WebElements.WORD_SECTION().style.display = "none";
    WebElements.WORD_SELECTION_SECTION().style.display = "none";
    WebElements.GUESS_SELECTION_SECTION().style.display = "none";
  }

  public static HIDE_START_STOP(): void {
    WebElements.START_DISCONNECT_BUTTONS().style.display = "none";
  }

  public static SHOW_START(): void {
    WebElements.START().style.display = "";
  }

  public static SHOW_WORD_SECTION(): void {
    WebElements.WORD_SECTION().style.display = "";
  }

  public static HIDE_WORD_SECTION(): void {
    WebElements.WORD_SECTION().style.display = "none";
  }

  public static SHOW_WORD_INPUT(): void {
    WebElements.WORD_SELECTION_SECTION().style.display = "";
  }

  public static HIDE_WORD_INPUT(): void {
    WebElements.WORD_SELECTION_SECTION().style.display = "none";
  }

  public static SHOW_GUESS_INPUT(): void {
    WebElements.GUESS_SELECTION_SECTION().style.display = "";
  }

  public static HIDE_GUESS_INPUT(): void {
    WebElements.GUESS_SELECTION_SECTION().style.display = "none";
  }
}
