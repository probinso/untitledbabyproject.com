export interface VideoPrompt {
  path: string;
  label: string;
  prompt: string;
}

export function videoPromptHref(path: string): string {
  return `/video/${path}`;
}

export const videoPrompts: VideoPrompt[] = [
  {
    path: "2027",
    label: "Life in 2027",
    prompt: "Tell them a big lie about what life is like in 2027.",
  },
  {
    path: "elders-story",
    label: "About The Elders",
    prompt: "Story of the elders in the kiddo's life.",
  },
  ...[2, 13, 17, 60].map((i) => ({
    path: `advice-${i}`,
    label: `Advice for age ${i}`,
    prompt: `What advice do you have for kiddo at age ${i}?`,
  })),
];
