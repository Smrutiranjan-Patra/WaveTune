import { getAlbums } from "../../helpers/library/albums";
import { getPersistedSongs } from "./songs.repository";

export async function getPersistedAlbums() {
  return getAlbums(await getPersistedSongs());
}
