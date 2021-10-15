/**
 * Perform a Fisher-Yates shuffle on given array. O(n) runtime.
 * Code copied from https://bost.ocks.org/mike/shuffle/
 *
 * @param array Array to shuffle
 * @returns {@param array}, but in a random order.
 */
export function FisherYatesShuffle<T>(array: T[]): T[] {
  let m = array.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}
