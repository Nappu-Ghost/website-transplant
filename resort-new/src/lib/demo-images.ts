export type DemoImageTag = 'hotel' | 'room' | 'activity';

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function demoImageUrl(tag: DemoImageTag, seed?: string) {
  const lock = seed ? hashString(`${tag}:${seed}`) : Math.floor(Math.random() * 1_000_000);
  return `https://loremflickr.com/640/480/${encodeURIComponent(tag)}?lock=${lock}`;
}
