// A short, deliberately narrow list: only unambiguous, severe obscenities
// and slurs, not mild profanity or words that are merely silly.
const blockedWords = new Set([
  "fuck",
  "shit",
  "bitch",
  "cunt",
  "whore",
  "slut",
  "nigger",
  "nigga",
  "faggot",
  "retard",
  "chink",
  "spic",
  "kike",
  "tranny",
  "rape",
  "pedo",
  "pedophile",
]);

export function containsBlockedWord(text: string): boolean {
  const words = text.toLowerCase().match(/[a-z]+/g) ?? [];
  return words.some((word) => blockedWords.has(word));
}
