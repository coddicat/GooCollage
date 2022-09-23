export type Album = {
  uid: string;
}

export type GoogleSecret = {
  albumId: string
}

export type DbUser = {
  sub: string;
  revoked: boolean;
}
export type AppSettings = {
  client_id: string;
  client_secret: string;
}
export type GoogleAlbumInfo = {
  coverPhotoBaseUrl: string;
  id: string;
  title: string;
  mediaItemsCount: string;
}
export type Public = {
  name: string,
  status: boolean,
  version: string,
  password: boolean
}
