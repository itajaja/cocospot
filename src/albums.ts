import data from "./albums.json";

export interface Album {
  id: string;
  title: string;
  artist: string;
  spotifyId: string;
  coverUrl: string;
}

export const albums: Album[] = data;

export function findAlbum(id: string | undefined): Album | undefined {
  return albums.find((album) => album.id === id);
}

export function findAlbumBySpotifyId(spotifyId: string): Album | undefined {
  return albums.find((album) => album.spotifyId === spotifyId);
}
