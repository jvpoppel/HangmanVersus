export function playerListRow(playerName: string, playerToken: string, host: boolean): string {
  let nameCell: string = "<tr><td>" + playerName + "</td>";
  if (host) {
    return nameCell + "<td><button class='btn btn-danger' id='" + playerToken +"-kick'>Kick</button></td></tr>";
  }
  return nameCell + "</tr>";
}
