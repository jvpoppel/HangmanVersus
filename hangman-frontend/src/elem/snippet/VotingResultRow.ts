export function generateResultRow(castPlayer: string, receivePlayer: string) {
  return "<tr><td>{0}</td><td>{1}</td></tr>".replace("{0}", castPlayer).replace("{1}", receivePlayer);
}
