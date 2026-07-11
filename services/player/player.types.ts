export interface PlayerSong {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  artwork?: string;
  uri: string;
  duration?: number;
}