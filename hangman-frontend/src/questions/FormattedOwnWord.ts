export class FormattedOwnWord {

  private word: string;

  constructor(word: string) {
    this.word = word;
  }

  public static givenOwnWord(word: string): FormattedOwnWord {
    return new FormattedOwnWord(word);
  }

  public andGuesses(guesses: string[]): string {
    let result = "";
    const wordLst = Array.from(this.word);

    let index = 0;
    while (index < wordLst.length) {
      if (guesses.indexOf(wordLst[index].toLowerCase()) >= 0) {
        result += "<u>" + wordLst[index] + "</u>";
      } else {
        result += wordLst[index];
      }
      index ++;
    }
    return result;
  }
}
