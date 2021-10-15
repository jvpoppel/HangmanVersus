export function votingOption(playerToken: string, playerName: string): string {
  return "<option value='" + playerToken +"'>" + playerName + "</option>";
}
