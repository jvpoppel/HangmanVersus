export function playerListRow(playerName: string, playerToken: string, host: boolean, role: string, alive: boolean): string {
  let nameCell: string = "<tr class='{0}'><td>" + playerName + "</td>";
  if (role === "Narrator") {
    nameCell = nameCell.replace("{0}", "table-success");
  } else if (!alive) {
    nameCell = nameCell.replace("{0}", "table-danger");
  } else {
    nameCell = nameCell.replace("{0}", "");
  }
  if (host) {
    return nameCell + "<td><input type='radio' id='" + playerToken + "-narrator' name='narratorSelection'></td>" +
      "<td><button class='btn btn-danger' id='" + playerToken +"-kick'>Kick</button></td></tr>";
  }
  let fullRow = nameCell + "<td>{0}</td><td>{1}</td></tr>";
  if (role === "Not yet decided.") {
    fullRow = fullRow.replace("{0}", "???");
  } else {
    fullRow = fullRow.replace("{0}", role);
  }
  if (role === "Narrator") {
    fullRow = fullRow.replace("{1}", "---");
  } else if (alive) {
    fullRow = fullRow.replace("{1}", "Yes");
  } else {
    fullRow = fullRow.replace("{1}", "No");
  }
  return fullRow;
}
