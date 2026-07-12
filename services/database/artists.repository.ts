import { getArtists } from "../../helpers/library/artists";
import { getPersistedSongs } from "./songs.repository";

export async function getPersistedArtists() {
  return getArtists(await getPersistedSongs());
}
