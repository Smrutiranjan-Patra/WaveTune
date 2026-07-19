const adjectives = ["Bright","Chill","Golden","Midnight","Quiet","Weekend"];
const nouns = ["Beats", "Drive", "Mix", "Mood", "Replay", "Vibes"];

export function normalizePlaylistName(name: string) {
  return name.trim().toLocaleLowerCase();
}

export function isPlaylistNameTaken(name: string, existingNames: string[]) {
  const normalizedName = normalizePlaylistName(name);

  return existingNames.some(
    (existingName) => normalizePlaylistName(existingName) === normalizedName,
  );
}

export function generatePlaylistName(existingNames: string[]) {
  const attempts = adjectives.length * nouns.length;

  for (let index = 0; index < attempts; index += 1) {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const candidate = `${adjective} ${noun}`;

    if (!isPlaylistNameTaken(candidate, existingNames)) {
      return candidate;
    }
  }

  let suffix = existingNames.length + 1;

  while (isPlaylistNameTaken(`My Playlist ${suffix}`, existingNames)) {
    suffix += 1;
  }

  return `My Playlist ${suffix}`;
}
